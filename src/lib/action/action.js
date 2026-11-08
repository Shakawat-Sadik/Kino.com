"use server";
import { revalidateTag } from "next/cache";
import getAuthHeaders from "./integra";

// Failover: the backup backend is a runtime failsafe for the primary, not just
// a startup default. `||` alone only picks a URL once at module load — since the
// primary URL is a non-empty string it always wins, so the backup is never used
// when the primary is reachable-but-down (e.g. a cold/hung Render instance),
// which is exactly when we need it. API_BASES is the ordered list to try.
const API_BASES = [
  process.env.REMOTE_MAIN_SERVER_URL,
  process.env.REMOTE_BACKUP_SERVER_URL,
].filter(Boolean);

if (API_BASES.length === 0) {
  throw new Error(
    "No API server configured (set REMOTE_MAIN_SERVER_URL and/or REMOTE_BACKUP_SERVER_URL)",
  );
}

// Per-attempt timeout: how long to wait on one backend before failing over.
// Reads fail over aggressively; writes/uploads wait longer so we don't abort a
// request the server may already be processing (which could duplicate it).
const READ_TIMEOUT_MS = 6_000;
const WRITE_TIMEOUT_MS = 20_000;
const UPLOAD_TIMEOUT_MS = 30_000;

// Circuit breaker: once the primary fails, skip it for a cooldown window so we
// don't re-pay the timeout on every request while it's down.
const PRIMARY_COOLDOWN_MS = 30_000;
let primaryDownUntil = 0;

function orderedBases() {
  if (API_BASES.length < 2) return API_BASES;
  // During cooldown, try the backup first (primary stays as a last resort).
  return Date.now() < primaryDownUntil ? [API_BASES[1], API_BASES[0]] : API_BASES;
}

// Race the request against a timeout instead of aborting it. An AbortController
// signal opts a fetch out of Next's Data Cache; racing leaves the cached-read
// fetch untouched (and lets a slow primary still warm the cache in the
// background). Promise.race attaches a handler to `request`, so a late rejection
// after the timeout wins does not surface as an unhandled rejection.
function withTimeout(request, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([request, timeout]).finally(() => clearTimeout(timer));
}

// Low-level fetch with ordered failover across API_BASES. Returns the first
// Response that isn't a transport failure or a 5xx; throws only if every base
// fails. Trips/closes the circuit breaker based on the primary's health.
async function fetchWithFailover(endpoint, options = {}, { timeoutMs } = {}) {
  const bases = orderedBases();
  let lastError;

  for (let i = 0; i < bases.length; i++) {
    const base = bases[i];
    const isPrimary = base === API_BASES[0];
    const isLast = i === bases.length - 1;

    try {
      const request = fetch(`${base}${endpoint}`, options);
      const res = timeoutMs ? await withTimeout(request, timeoutMs) : await request;

      // A gateway-class error means this host is unhealthy — try the next one.
      if (res.status >= 500 && !isLast) {
        if (isPrimary) primaryDownUntil = Date.now() + PRIMARY_COOLDOWN_MS;
        lastError = new Error(`${base} responded ${res.status}`);
        continue;
      }

      if (isPrimary) primaryDownUntil = 0; // primary healthy → close the breaker
      return res;
    } catch (err) {
      if (isPrimary) primaryDownUntil = Date.now() + PRIMARY_COOLDOWN_MS;
      lastError = err;
      if (isLast) throw err;
    }
  }

  throw lastError ?? new Error("All API servers failed");
}

// ─────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────
const protectedEndpoints = [
  "/admin",
  "/dashboard",
  "/add-product",
  "/my-products",
  "/my-orders",
  "/wishlist",
  "/profile",
  "/checkout",
  "/payments",
  "/seller",
  "/buyer",
];

async function fetchAPI(endpoint, { tags, ...options } = {}) {
  const needsAuth = protectedEndpoints.some(
    (route) => endpoint === route || endpoint.startsWith(`${route}/`),
  );

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (needsAuth) {
    const token = await getAuthHeaders();
    if (!token) {
      return { success: false, message: "Not authenticated", result: null };
    }
    headers.authorization = `Bearer ${token}`;
  }

  // Public requests use ISR (revalidate every 60 seconds), protected requests are dynamic
  const cacheConfig = needsAuth
    ? { cache: "no-store" }
    : {
        next: {
          revalidate: 60,
          tags: tags || [],
        },
      };

  const timeoutMs =
    options.method && options.method !== "GET" ? WRITE_TIMEOUT_MS : READ_TIMEOUT_MS;

  try {
    const res = await fetchWithFailover(
      endpoint,
      { ...options, headers, ...cacheConfig },
      { timeoutMs },
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        result: null,
      };
    }

    return data;
  } catch (error) {
    console.error("[fetchAPI] Error:", error.message);
    return {
      success: false,
      message: error.message || "Network error. Is the server running?",
      result: null,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC PRODUCT ACTIONS
// Express routes:
//   GET /products             → all products (public)
//   GET /products/:id         → single product (public)
// ─────────────────────────────────────────────────────────────

export async function getProducts(query = {}) {
  const params = new URLSearchParams();
  params.set("status", query.status || "available");
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.condition) params.set("condition", query.condition);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/products${qs ? `?${qs}` : ""}`, { tags: ["products"] });
}

export async function getProductById(id) {
  return await fetchAPI(`/products/${id}`, { tags: ["products"] });
}

// ─────────────────────────────────────────────────────────────
// SELLER — PRODUCT ACTIONS
// Express routes:
//   GET    /seller/products           → seller's own products
//   POST   /seller/products           → create product
//   PATCH  /seller/products/:id       → update product
//   DELETE /seller/products/:id       → delete product
// ─────────────────────────────────────────────────────────────

export async function getMyProducts(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/seller/products${qs ? `?${qs}` : ""}`);
}

export async function createProduct(productData) {
  const result = await fetchAPI("/seller/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
  if (result.success) {
    revalidateTag("products");
    revalidateTag("stats");
  }
  return result;
}

export async function updateProduct(productId, updateData) {
  const result = await fetchAPI(`/seller/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
  if (result.success) revalidateTag("products");
  return result;
}

export async function deleteProduct(productId) {
  const result = await fetchAPI(`/seller/products/${productId}`, {
    method: "DELETE",
  });
  if (result.success) {
    revalidateTag("products");
    revalidateTag("stats");
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// SELLER — ORDER ACTIONS
// Express routes:
//   GET   /seller/orders              → seller's incoming orders
//   PATCH /seller/orders/:id/status   → update order status
// ─────────────────────────────────────────────────────────────

export async function getSellerOrders(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/seller/orders${qs ? `?${qs}` : ""}`);
}

export async function updateSellerOrderStatus(orderId, status) {
  return await fetchAPI(`/seller/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─────────────────────────────────────────────────────────────
// SELLER — STATS
// Express routes:
//   GET /seller/stats → { totalProducts, totalSales (delivered orders), totalRevenue, pendingOrders }
// ─────────────────────────────────────────────────────────────

export async function getSellerStats() {
  return await fetchAPI("/seller/stats");
}

// ─────────────────────────────────────────────────────────────
// SELLER — ANALYTICS
// Express routes:
//   GET /seller/analytics → { monthlySales, topProducts }
// ─────────────────────────────────────────────────────────────

export async function getSellerAnalytics() {
  return await fetchAPI("/seller/analytics");
}

// ─────────────────────────────────────────────────────────────
// BUYER — ORDER ACTIONS
// Express routes:
//   GET   /buyer/orders              → buyer's own orders
//   PATCH /buyer/orders/:id/cancel   → cancel a pending order
// ─────────────────────────────────────────────────────────────

export async function getMyOrders(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/buyer/orders${qs ? `?${qs}` : ""}`);
}

export async function cancelOrder(orderId) {
  return await fetchAPI(`/buyer/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
}

// ─────────────────────────────────────────────────────────────
// BUYER — WISHLIST ACTIONS
// Express routes:
//   GET    /wishlist          → user's wishlist products (populated)
//   POST   /wishlist/:id      → add product to wishlist
//   DELETE /wishlist/:id      → remove product from wishlist
// ─────────────────────────────────────────────────────────────

export async function getWishlist() {
  return await fetchAPI("/wishlist");
}

export async function addToWishlist(productId) {
  return await fetchAPI(`/wishlist/${productId}`, {
    method: "POST",
  });
}

export async function removeFromWishlist(productId) {
  return await fetchAPI(`/wishlist/${productId}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────────────────────
// BUYER — PAYMENT HISTORY
// Express routes:
//   GET /payments/my-history → buyer's payment records
// ─────────────────────────────────────────────────────────────

export async function getMyPayments(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/payments/my-history${qs ? `?${qs}` : ""}`);
}

// ─────────────────────────────────────────────────────────────
// STRIPE PAYMENT ACTIONS
// Express routes:
//   POST /payments/create-intent  → { clientSecret }
//   POST /payments/confirm        → { orderId }
// ─────────────────────────────────────────────────────────────

export async function createPaymentIntent({ amount, productId, productTitle }) {
  return await fetchAPI("/payments/create-intent", {
    method: "POST",
    body: JSON.stringify({ amount, productId, productTitle }),
  });
}

export async function confirmPayment({ transactionId, productId, sellerEmail, amount, productTitle }) {
  const result = await fetchAPI("/payments/confirm", {
    method: "POST",
    body: JSON.stringify({ transactionId, productId, sellerEmail, amount, productTitle }),
  });
  if (result.success) {
    revalidateTag("products");
    revalidateTag("stats");
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// PUBLIC STATS (Home Page)
// Express route: GET /stats → { totalProducts, totalSellers, totalBuyers, totalOrders }
// ─────────────────────────────────────────────────────────────

export async function getMarketplaceStats() {
  return await fetchAPI("/stats", { tags: ["stats"] });
}

// ─────────────────────────────────────────────────────────────
// PUBLIC SELLERS
// Express route: GET /sellers/top → top sellers by product count (public)
// ─────────────────────────────────────────────────────────────

export async function getTopSellers(limit = 3) {
  return await fetchAPI(`/sellers/top?limit=${limit}`, { tags: ["sellers"] });
}

// ─────────────────────────────────────────────────────────────
// REVIEWS
// Express routes:
//   GET  /reviews                → latest high-rated reviews (public)
//   GET  /reviews/:productId     → reviews for a product (public)
//   POST /reviews                → submit a review (buyer only)
// ─────────────────────────────────────────────────────────────

export async function getAllReviews(limit = 6) {
  return await fetchAPI(`/reviews?limit=${limit}`, { tags: ["reviews"] });
}

export async function getProductReviews(productId) {
  return await fetchAPI(`/reviews/${productId}`, { tags: ["reviews"] });
}

export async function addReview({ productId, rating, comment }) {
  try {
    const token = await getAuthHeaders();
    if (!token) return { success: false, message: "Not authenticated", result: null };
    const res = await fetchWithFailover(
      "/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, rating, comment }),
        cache: "no-store",
      },
      { timeoutMs: WRITE_TIMEOUT_MS },
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || "Request failed", result: null };
    }
    revalidateTag("reviews");
    return data;
  } catch (error) {
    return { success: false, message: error.message || "Network error", result: null };
  }
}
// ─────────────────────────────────────────────────────────────
// BUYER — STATS
// Express routes:
//   GET /buyer/stats → { totalOrders, wishlistCount, recentPurchases }
// ─────────────────────────────────────────────────────────────

export async function getBuyerStats() {
  return await fetchAPI("/buyer/stats");
}

// ─────────────────────────────────────────────────────────────
// SHARED — PROFILE ACTIONS
// Express routes:
//   GET   /profile → current user's profile
//   PATCH /profile → update profile fields
// ─────────────────────────────────────────────────────────────

export async function getMyProfile() {
  return await fetchAPI("/profile");
}

export async function updateMyProfile(updateData) {
  const allowedFields = ["name", "contact", "location", "image"];
  const filtered = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) filtered[field] = updateData[field];
  }
  return await fetchAPI("/profile", {
    method: "PATCH",
    body: JSON.stringify(filtered),
  });
}

export async function switchMyRole(role) {
  if (role !== "buyer" && role !== "seller") {
    return { success: false, message: "Invalid role" };
  }
  return await fetchAPI("/profile", {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

// ─────────────────────────────────────────────────────────────
// ADMIN — STATS
// Express routes:
//   GET /admin/stats/users    → { success, result: { total } }
//   GET /admin/stats/products → { success, result: { total } }
//   GET /admin/stats/orders   → { success, result: { total } }
// ─────────────────────────────────────────────────────────────

export async function getTotalUsers() {
  return await fetchAPI("/admin/stats/users");
}

export async function getTotalProducts() {
  return await fetchAPI("/admin/stats/products");
}

export async function getTotalOrders() {
  return await fetchAPI("/admin/stats/orders");
}

export async function getTotalRevenue() {
  return await fetchAPI("/admin/stats/revenue");
}

export async function getTotalRevenueByMonth() {
  return await fetchAPI("/admin/stats/revenue-by-month");
}

export async function getAdminSummary() {
  return await fetchAPI("/admin/analytics/summary")
}

// ─────────────────────────────────────────────────────────────
// ADMIN — USERS
// Express routes:
//   GET    /admin/users              → { success, result: User[] }
//   PATCH  /admin/users/:id/status   → { success, result: User }
//   DELETE /admin/users/:id          → { success, result: null }
// ─────────────────────────────────────────────────────────────

export async function getAdminUsers(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function updateUserStatus(userId, status) {
  return await fetchAPI(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateAdminUser(userId, { name, role, location, contact }) {
  const payload = {};
  if (name !== undefined) payload.name = name;
  if (role !== undefined) payload.role = role;
  if (location !== undefined) payload.location = location;
  if (contact !== undefined) payload.contact = contact;
  return await fetchAPI(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId) {
  return await fetchAPI(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────────────────────
// ADMIN — PRODUCTS
// Express routes:
//   GET    /admin/products              → { success, result: Product[] }
//   PATCH  /admin/products/:id/status   → { success, result: Product }
//   DELETE /admin/products/:id          → { success, result: null }
// ─────────────────────────────────────────────────────────────

export async function getAdminProducts(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/admin/products${qs ? `?${qs}` : ""}`);
}

export async function updateAdminProduct(productId, { title, category, condition, price, description }) {
  const payload = {};
  if (title !== undefined) payload.title = title;
  if (category !== undefined) payload.category = category;
  if (condition !== undefined) payload.condition = condition;
  if (price !== undefined) payload.price = price;
  if (description !== undefined) payload.description = description;
  const result = await fetchAPI(`/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (result.success) revalidateTag("products");
  return result;
}

export async function updateProductStatus(productId, status) {
  const result = await fetchAPI(`/admin/products/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (result.success) revalidateTag("products");
  return result;
}

export async function deleteAdminProduct(productId) {
  const result = await fetchAPI(`/admin/products/${productId}`, {
    method: "DELETE",
  });
  if (result.success) {
    revalidateTag("products");
    revalidateTag("stats");
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// ADMIN — PAYMENTS
// Express routes:
//   GET /admin/payments → { success, result: Payment[], total }
// ─────────────────────────────────────────────────────────────

export async function getAdminPayments(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/admin/payments${qs ? `?${qs}` : ""}`);
}

// ─────────────────────────────────────────────────────────────
// ADMIN — ORDERS
// Express routes:
//   GET   /admin/orders            → { success, result: Order[] }
//   PATCH /admin/orders/:id/status → { success, result: Order }
// ─────────────────────────────────────────────────────────────

export async function getAdminOrders(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return await fetchAPI(`/admin/orders${qs ? `?${qs}` : ""}`);
}

export async function updateOrderStatus(orderId, status) {
  return await fetchAPI(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─────────────────────────────────────────────────────────────
// ADMIN — ANALYTICS
// Express routes:
//   GET /admin/analytics → {
//     success,
//     result: {
//       monthlyOrders: [{ month, count }],
//       categoryPerformance: [{ category, count }],
//       userGrowth: [{ month, count }],
//       revenueByMonth: [{ month, revenue }]
//     }
//   }
// ─────────────────────────────────────────────────────────────

export async function getAdminAnalytics() {
  return await fetchAPI("/admin/analytics");
}

// ─────────────────────────────────────────────────────────────
// UPLOAD ACTIONS
// Express routes:
//   POST   /upload             → upload image (raw binary body)
//   DELETE /upload/:publicId   → delete image by Cloudinary public_id
// ─────────────────────────────────────────────────────────────

export async function uploadImage(file, folder = "Kino.com/products") {
  try {
    const token = await getAuthHeaders();
    if (!token) return { success: false, message: "Not authenticated", result: null };

    const res = await fetchWithFailover(
      "/upload",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": file.type,
          "x-upload-folder": folder,
          "x-upload-filename": file.name,
        },
        body: file,
        cache: "no-store",
      },
      { timeoutMs: UPLOAD_TIMEOUT_MS },
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || "Upload failed", result: null };
    }
    return data;
  } catch (error) {
    console.error("[uploadImage] Error:", error.message);
    return { success: false, message: "Network error during upload.", result: null };
  }
}

export async function deleteImage(publicId) {
  try {
    const token = await getAuthHeaders();
    if (!token) return { success: false, message: "Not authenticated", result: null };

    // publicId may contain slashes (e.g. "Kino.com/products/abc123") —
    // the Express wildcard route /*publicId captures the full path correctly
    const res = await fetchWithFailover(
      `/upload/${publicId}`,
      {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      },
      { timeoutMs: WRITE_TIMEOUT_MS },
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || "Delete failed", result: null };
    }
    return data;
  } catch (error) {
    console.error("[deleteImage] Error:", error.message);
    return { success: false, message: "Network error during delete.", result: null };
  }
}
