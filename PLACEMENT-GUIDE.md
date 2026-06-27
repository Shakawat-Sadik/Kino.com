# Buyer & Seller Dashboard — File Placement Guide

---

## NEXT.JS APP DIRECTORY STRUCTURE

```
src/
├── app/
│   └── dashboard/
│       ├── layout.jsx                          ← DashboardLayout (already built)
│       │
│       ├── actions/
│       │   └── actions.js                      ← unified actions file (this batch)
│       │
│       ├── buyer/
│       │   ├── layout.jsx                      ← RoleGuard allowedRoles={["buyer"]}
│       │   ├── page.jsx                        ← BuyerDashboardPage
│       │   ├── orders/
│       │   │   └── page.jsx                    ← BuyerOrdersPage
│       │   ├── wishlist/
│       │   │   └── page.jsx                    ← BuyerWishlistPage
│       │   ├── payments/
│       │   │   └── page.jsx                    ← BuyerPaymentsPage
│       │   └── profile/
│       │       └── page.jsx                    ← ProfileSettingsPage
│       │
│       └── seller/
│           ├── layout.jsx                      ← RoleGuard allowedRoles={["seller", "admin"]}
│           ├── page.jsx                        ← SellerDashboardPage
│           ├── products/
│           │   ├── page.jsx                    ← SellerProductsPage
│           │   └── add/
│           │       └── page.jsx                ← AddProductPage
│           ├── orders/
│           │   └── page.jsx                    ← SellerOrdersPage
│           ├── analytics/
│           │   └── page.jsx                    ← SellerAnalyticsPage
│           └── profile/
│               └── page.jsx                    ← ProfileSettingsPage (same component)
│
└── components/
    └── dashboard/
        ├── DashboardSidebar.jsx                ← already built
        ├── DashboardHeader.jsx                 ← already built
        └── shared/
            ├── StatusBadge.jsx                 ← this batch
            └── DashStatCard.jsx                ← this batch
```

---

## EACH PAGE FILE CONTENT

Each `page.jsx` is just a thin wrapper that imports and re-exports the component:

```jsx
// app/dashboard/buyer/page.jsx
export { default } from "@/components/dashboard/buyer/BuyerDashboardPage";

// app/dashboard/buyer/orders/page.jsx
export { default } from "@/components/dashboard/buyer/BuyerOrdersPage";

// app/dashboard/buyer/wishlist/page.jsx
export { default } from "@/components/dashboard/buyer/BuyerWishlistPage";

// app/dashboard/buyer/payments/page.jsx
export { default } from "@/components/dashboard/buyer/BuyerPaymentsPage";

// app/dashboard/buyer/profile/page.jsx
export { default } from "@/components/dashboard/shared/ProfileSettingsPage";

// app/dashboard/seller/page.jsx
export { default } from "@/components/dashboard/seller/SellerDashboardPage";

// app/dashboard/seller/products/page.jsx
export { default } from "@/components/dashboard/seller/SellerProductsPage";

// app/dashboard/seller/products/add/page.jsx
export { default } from "@/components/dashboard/seller/AddProductPage";

// app/dashboard/seller/orders/page.jsx
export { default } from "@/components/dashboard/seller/SellerOrdersPage";

// app/dashboard/seller/analytics/page.jsx
export { default } from "@/components/dashboard/seller/SellerAnalyticsPage";

// app/dashboard/seller/profile/page.jsx
export { default } from "@/components/dashboard/shared/ProfileSettingsPage";
```

---

## BUYER AND SELLER LAYOUT FILES

```jsx
// app/dashboard/buyer/layout.jsx
import { RoleGuard } from "@/components/All/auth/RoleGuard";
export default function BuyerLayout({ children }) {
  return <RoleGuard allowedRoles={["buyer"]}>{children}</RoleGuard>;
}

// app/dashboard/seller/layout.jsx
import { RoleGuard } from "@/components/All/auth/RoleGuard";
export default function SellerLayout({ children }) {
  return <RoleGuard allowedRoles={["seller", "admin"]}>{children}</RoleGuard>;
}
```

---

## EXPRESS BACKEND — WHAT TO ADD TO index.js

### Step 1 — Add the two new guard middlewares after adminGuard:

```js
const sellerGuard = async (req, res, next) => {
  // ... (copy from backend-routes.js)
};

const buyerGuard = async (req, res, next) => {
  // ... (copy from backend-routes.js)
};
```

### Step 2 — Mount the guards on route groups (add after your existing admin guard line):

```js
// Existing line you already have:
app.use("/admin", verifyToken, adminGuard);

// Add these:
app.use("/seller", verifyToken, sellerGuard);
app.use("/buyer", verifyToken, buyerGuard);
app.use("/wishlist", verifyToken, buyerGuard);
app.use("/payments", verifyToken, buyerGuard);
app.use("/profile", verifyToken);
```

### Step 3 — Append all routes from backend-routes.js after your existing routes.

---

## DATA SHAPE REFERENCE

### Order document (what Stripe creates on success):
```json
{
  "buyerInfo": { "userId": "...", "name": "...", "email": "..." },
  "sellerInfo": { "userId": "...", "name": "...", "email": "..." },
  "productId": "...",
  "productTitle": "Used Dell Laptop",
  "amount": 35000,
  "paymentStatus": "paid",
  "orderStatus": "pending"
}
```

### Payment document (created alongside order):
```json
{
  "orderId": "...",
  "buyerId": "...",
  "transactionId": "stripe_session_id",
  "amount": 35000,
  "paymentStatus": "success",
  "paymentDate": "2025-06-01T00:00:00Z"
}
```

### User document with wishlist:
```json
{
  "name": "...",
  "email": "...",
  "role": "buyer",
  "phone": "...",
  "location": "...",
  "image": "...",
  "status": "active",
  "wishlist": ["productId1", "productId2"]
}
```

---

## ORDER STATUS FLOW

```
[Buyer places order]
      ↓
  pending  ← buyer can CANCEL here only
      ↓ seller accepts
  accepted ← seller can still REJECT here
      ↓ seller processes
  processing
      ↓ seller ships
  shipped
      ↓ seller marks delivered
  delivered ✓

  cancelled ← terminal state, no further changes
```

---

## COMPONENTS FOLDER FOR DASHBOARD

Move each page component into the right folder under `src/components/dashboard/`:

```
components/dashboard/
├── DashboardSidebar.jsx
├── DashboardHeader.jsx
├── shared/
│   ├── StatusBadge.jsx
│   ├── DashStatCard.jsx
│   └── ProfileSettingsPage.jsx
├── buyer/
│   ├── BuyerDashboardPage.jsx
│   ├── BuyerOrdersPage.jsx
│   ├── BuyerWishlistPage.jsx
│   └── BuyerPaymentsPage.jsx
└── seller/
    ├── SellerDashboardPage.jsx
    ├── SellerProductsPage.jsx
    ├── AddProductPage.jsx
    ├── SellerOrdersPage.jsx
    └── SellerAnalyticsPage.jsx
```
