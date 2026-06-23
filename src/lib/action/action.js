"use server";
import getAuthHeaders from "./integra";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REMOTE_SERVER_URL
    : process.env.SERVER_URL || "http://localhost:5000";
// ─────────────────────────────────────
// Helper: Core fetch wrapper
// ─────────────────────────────────────
async function fetchAdminAPI(endpoint, options = {}) {
  const protectedEndpoints = ["/dashboard", "/my-products", "/my-orders", "/profile", "/profile/", "/wishlist", "/reviews"];

  const needsAuth = protectedEndpoints.some(
    (route) =>
    endpoint.startsWith(route),
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

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });

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
    // console.error("API Error:", error);
    console.error("[fetchAdminAPI] Error:", error.message);
    console.error("Cause:", error.cause);
    console.error("Stack:", error.stack);
    return {
      success: false,
      message: error.message || "Network error. Is the server running?",
      result: null,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// STATS
// Three separate calls as requested — one per stat card
// Express routes needed:
//   GET /admin/stats/users    → { success, result: { total } }
//   GET /admin/stats/products → { success, result: { total } }
//   GET /admin/stats/orders   → { success, result: { total } }
// ─────────────────────────────────────────────────────────────

export async function getTotalUsers() {
  return await fetchAdminAPI("/admin/stats/users");
}

export async function getTotalProducts() {
  return await fetchAdminAPI("/admin/stats/products");
}

export async function getTotalOrders() {
  return await fetchAdminAPI("/admin/stats/orders");
}

// ─────────────────────────────────────────────────────────────
// USERS
// Express routes needed:
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

  // const queryString = params.toString();
  // console.log("Query String for getAdminUsers:", queryString); // Debugging line
  // const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;

  const qs = params.toString();
  return await fetchAdminAPI(`/admin/users${qs ? `?${qs}` : ""}`);
}



export async function updateUserStatus(userId, status) {
  return await fetchAdminAPI(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteUser(userId) {
  return await fetchAdminAPI(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

/**
 * Fetch a single doctor by slug
 */
// export async function getDoctorBySlug(slug) {
//   return await fetchAPI(`/doctors/${slug}`);
// }
// ─────────────────────────────────────────────────────────────
// PRODUCTS
// Express routes needed:
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
  return await fetchAdminAPI(`/admin/products${qs ? `?${qs}` : ""}`);
}

export async function updateProductStatus(productId, status) {
  return await fetchAdminAPI(`/admin/products/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteProduct(productId) {
  return await fetchAdminAPI(`/admin/products/${productId}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────────────────────
// ORDERS
// Express routes needed:
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
  return await fetchAdminAPI(`/admin/orders${qs ? `?${qs}` : ""}`);
}

export async function updateOrderStatus(orderId, status) {
  return await fetchAdminAPI(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// Express route needed:
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
  return await fetchAdminAPI("/admin/analytics");
}

// // ─────────────────────────────────────
// // APPOINTMENT ACTIONS
// // ─────────────────────────────────────

// /**
//  * Fetch appointments for a specific user
//  */
// export async function getAppointments(email) {
//   return await fetchAPI(`/appointments?email=${encodeURIComponent(email)}`);
// }

// /**
//  * Fetch a single appointment by ID
//  */
// export async function getAppointmentById(id) {
//   return await fetchAPI(`/appointments/${id}`);
// }

// /**
//  * Create a new appointment
//  */
// export async function createAppointment(appointmentData) {
//   return await fetchAPI("/appointments", {
//     method: "POST",
//     body: JSON.stringify({
//       ...appointmentData,
//       createdAt: new Date(),
//       status: appointmentData.status || "Confirmed",
//     }),
//   });
// }

// /**
//  * Update an existing appointment (only allowed fields)
//  */
// export async function updateAppointment(id, updateData) {
//   const allowedFields = [
//     "patientName",
//     "gender",
//     "phone",
//     "appointmentDate",
//     "appointmentTime",
//     "notes",
//     "status",
//   ];

//   const filteredData = {};
//   for (const field of allowedFields) {
//     if (updateData[field] !== undefined) {
//       filteredData[field] = updateData[field];
//     }
//   }

//   return await fetchAPI(`/appointments/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(filteredData),
//   });
// }

// /**
//  * Delete an appointment
//  */
// export async function deleteAppointment(id) {
//   return await fetchAPI(`/appointments/${id}`, {
//     method: "DELETE",
//   });
// }

// // ─────────────────────────────────────
// // REVIEW ACTIONS
// // ─────────────────────────────────────

// /**
//  * Add a review for a doctor
//  */
// export async function addReview(doctorSlug, reviewData) {
//   return await fetchAPI("/reviews", {
//     method: "POST",
//     body: JSON.stringify({
//       ...reviewData,
//       doctorSlug,
//       createdAt: new Date(),
//     }),
//   });
// }
