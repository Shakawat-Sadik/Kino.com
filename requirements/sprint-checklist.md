# Assignment 10 — Sprint Checklist
### 2 Days Gone. 5 Days Remain. Every Hour Counts.

> **How to use this list**
> - Work top to bottom, do not skip ahead
> - ✅ Tick each box the moment it's done — not "almost done", DONE
> - ⚡ means "do this before anything else today"
> - 🔴 means "blocking — nothing after this works until this is resolved"
> - 🟡 means "important but not blocking"
> - 🟢 means "nice to have, do it only if ahead of schedule"
> - **Commit after every section, not at end of day**
> - If stuck >30 min on one item → PH live support or Facebook group immediately

---

## WHAT YOU ALREADY HAVE (Credit for Days 1–2)
- [ ] Project named and repos created (client + server)
- [ ] Next.js app initialised with Tailwind + Shadcn
- [ ] globals.css palette applied (your two oklch anchors)
- [ ] BetterAuth installed and partially wired
- [ ] Navbar built and working
- [ ] Login form working (email/password + Google OAuth fixed)
- [ ] Basic folder structure in place

> **If any of the above are not actually done, do them before Day 3 starts.**
> They are prerequisites for everything below.

---

---

# DAY 3
### Theme: Auth Solid + Backend Alive + MongoDB Connected
> Goal by midnight: A logged-in user has a role. Express is running. DB is connected. Deploy skeletons are live.

---

## SECTION A — BetterAuth Completion 🔴
> Nothing else works until role-based auth is solid.

### A1 — User Schema & Role Field
- [ ] ⚡ Confirm `role` field exists on the user document in MongoDB (`buyer` / `seller` / `admin`)
- [ ] ⚡ Confirm `role` is included in the JWT payload BetterAuth issues
- [ ] Test: register a new user → check MongoDB → `role: "buyer"` should be there
- [ ] Test: decode the JWT → `role` claim should be visible

### A2 — Registration Form
- [ ] Role selector on register page (`buyer` or `seller` — two options, radio or select)
- [ ] Location field on register form (required by assignment)
- [ ] Phone number field on register form
- [ ] Form submits → user created in MongoDB with correct role
- [ ] Google OAuth registers user with default role `buyer` (role can be changed from profile later)
- [ ] **Commit:** `feat: registration with role selection and location field`

### A3 — Auth Pages Polish
- [ ] Register page renders correctly, no layout breaks
- [ ] Login page working (you already fixed this — just verify)
- [ ] Redirect after login goes to correct dashboard based on role
  - buyer → `/dashboard/buyer`
  - seller → `/dashboard/seller`
  - admin → `/dashboard/admin`
- [ ] `/dashboard` route reads role and redirects automatically (single entry point)
- [ ] Private routes survive page reload (BetterAuth session persists via cookie)
- [ ] Unauthenticated access to private routes → redirect to `/auth/login?redirect=<page>`
- [ ] **Commit:** `feat: role-based redirect and protected route persistence`

---

## SECTION B — Express Backend Foundation 🔴

### B1 — Server Setup
- [ ] ⚡ Express server running locally on port 5000 (or your choice)
- [ ] ⚡ MongoDB connected via MongoClient (connection string in `.env`)
- [ ] CORS configured — allow your Next.js frontend origin explicitly, not `*`
- [ ] `.env` file has: `MONGODB_URI`, `JWT_SECRET` (or JWKS URL), `CLIENT_URL`
- [ ] `.env` is in `.gitignore` — verify this before any commit
- [ ] Health check route: `GET /` returns `{ status: "ok" }`
- [ ] **Commit:** `feat: express server with mongodb connection and cors`

### B2 — jose JWT Middleware (reuse MediQueue pattern)
- [ ] `verifyToken` middleware using `createRemoteJWKSet` + `jwtVerify` from `jose`
- [ ] `requireRole(...roles)` middleware that reads `req.user.role` and returns 403 if wrong
- [ ] Test both middlewares with Postman or Thunder Client before wiring to routes
- [ ] **Commit:** `feat: jose JWT verification and role-based middleware`

### B3 — MongoDB Collections Scaffolded
- [ ] `users` collection (BetterAuth manages this, confirm it exists)
- [ ] `products` collection (empty for now)
- [ ] `orders` collection (empty for now)
- [ ] `payments` collection (empty for now)
- [ ] `reviews` collection (empty for now — lowest priority, do last)

---

## SECTION C — Deployment Skeletons 🟡
> Deploy now while empty so you catch CORS/build errors early, not on Day 5

### C1 — Client Deploy (Vercel)
- [ ] Push client to GitHub
- [ ] Connect to Vercel, deploy
- [ ] Set environment variables in Vercel dashboard (BetterAuth keys, API URL)
- [ ] Confirm deployed URL loads without build error
- [ ] **Commit:** `chore: initial client deployment to vercel`

### C2 — Server Deploy (Railway / Render / your choice)
- [ ] Push server to GitHub
- [ ] Connect to Railway or Render, deploy
- [ ] Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`)
- [ ] Confirm `GET /` health check works on deployed URL
- [ ] Update client `.env` with deployed server URL
- [ ] **Commit:** `chore: initial server deployment`

---

## DAY 3 CHECKPOINT
Before sleeping, verify:
- [ ] Can register as buyer → role is `buyer` in DB
- [ ] Can register as seller → role is `seller` in DB
- [ ] JWT contains role claim
- [ ] Express is running and deployed
- [ ] MongoDB is connected
- [ ] Both repos have meaningful commits today

**If Section A is not complete by end of Day 3 → everything on Day 4 is blocked.**
**Do not move to Day 4 without A1–A3 done.**

---

---

# DAY 4
### Theme: Products + Stripe + Orders Core
> Goal by midnight: A seller can list a product with an image. A buyer can pay for it. An order exists in the DB.

---

## SECTION D — Firebase Storage + Product Images 🟡

### D1 — Firebase Storage Setup
- [ ] Firebase project created (if not already)
- [ ] Firebase Storage bucket created
- [ ] Firebase config added to client `.env` (all keys — never commit these)
- [ ] `firebase.js` initialised in `src/lib/`
- [ ] Upload function written: takes a `File` object, returns a download URL

### D2 — Image Upload Component
- [ ] `<ImageUpload />` component: file input → preview → upload on form submit
- [ ] Shows upload progress or loading state
- [ ] Returns URL after upload completes
- [ ] Handles error (file too large, wrong type)
- [ ] **Commit:** `feat: firebase storage image upload component`

---

## SECTION E — Product CRUD 🔴

### E1 — Backend Product Routes
- [ ] `POST /products` — create product (seller only, `requireRole("seller")`)
  - Accepts: title, description, category, condition, price, quantity, images array, sellerInfo
  - Returns: created product document
- [ ] `GET /products` — get all available products (public)
- [ ] `GET /products/:id` — get single product (public)
- [ ] `GET /products/seller/mine` — get seller's own products (seller only)
- [ ] `PATCH /products/:id` — update product (seller only, must be their own product)
- [ ] `DELETE /products/:id` — delete product (seller only, must be their own product)
- [ ] **Commit:** `feat: product CRUD routes with seller authorization`

### E2 — Add Product Page (Seller)
- [ ] Route: `/dashboard/seller/products/add` (protected, seller only)
- [ ] Form fields:
  - [ ] Product title (text input)
  - [ ] Description (textarea)
  - [ ] Category (select: Electronics, Fashion, Furniture, Vehicles, Mobile Phones, Other)
  - [ ] Condition (select: Used, Like New, Refurbished)
  - [ ] Price (number input)
  - [ ] Stock quantity (number input)
  - [ ] Image upload (uses `<ImageUpload />` from D2)
- [ ] Form submits to `POST /products` with JWT token in Authorization header
- [ ] Success → redirect to My Products page
- [ ] Error → show toast with message
- [ ] **Commit:** `feat: add product form with image upload`

### E3 — My Products Page (Seller)
- [ ] Route: `/dashboard/seller/products`
- [ ] Fetches from `GET /products/seller/mine`
- [ ] Table or card list showing: image thumbnail, title, price, condition, status
- [ ] Edit button → opens edit form (pre-filled with current data)
- [ ] Delete button → confirmation dialog → calls `DELETE /products/:id`
- [ ] **Commit:** `feat: seller product management page with edit and delete`

### E4 — Public Product Pages
- [ ] All Products page (`/listings` or `/products`): fetches `GET /products`, shows product cards
- [ ] Product card: image, title, price, condition, category badge, "View Details" button
- [ ] Product Detail page (`/products/:id`): fetches `GET /products/:id`
  - Shows: all images, title, description, price, condition, category, seller info
  - "Add to Wishlist" button
  - "Buy Now" / "Place Order" button → goes to checkout
- [ ] **Commit:** `feat: public product listing and detail pages`

---

## SECTION F — Stripe Payment + Order Creation 🔴
> This is the riskiest section. Give it the most time. Do not rush it.

### F1 — Stripe Backend Routes
- [ ] Install Stripe: `npm install stripe` on server
- [ ] `POST /payments/create-checkout-session`
  - Protected route (buyer only)
  - Creates a Stripe Checkout Session with product info
  - Returns `{ url }` — the Stripe hosted checkout URL
  - Set `success_url` to `/payment/success?session_id={CHECKOUT_SESSION_ID}`
  - Set `cancel_url` to `/checkout/cancel`
- [ ] `POST /payments/confirm`
  - Called after Stripe redirects back to your success URL
  - Receives `session_id`, verifies payment with Stripe
  - Creates order document in `orders` collection
  - Creates payment document in `payments` collection
  - Returns order details
- [ ] **Commit:** `feat: stripe checkout session and payment confirmation routes`

### F2 — Checkout Page (Client)
- [ ] Route: `/checkout` (private, buyer only)
- [ ] Receives product info (via query params or state)
- [ ] Shows: product name, price, quantity, total, delivery info fields
- [ ] "Proceed to Payment" button → calls `POST /payments/create-checkout-session` → redirects to Stripe URL
- [ ] "Cancel" button → back to product page
- [ ] Loading state while Stripe session is being created
- [ ] **Commit:** `feat: checkout page with stripe redirect`

### F3 — Payment Success Page (Client)
- [ ] Route: `/payment/success`
- [ ] On mount: reads `session_id` from URL params
- [ ] Calls `POST /payments/confirm` with `session_id`
- [ ] Shows: success message, order summary, payment amount, transaction ID, payment date
- [ ] Buttons: "View My Orders", "Continue Shopping"
- [ ] Handle case where session_id is missing or payment failed
- [ ] **Commit:** `feat: payment success page with order confirmation`

### F4 — Stripe Test
- [ ] Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC
- [ ] Complete a full payment flow: product → checkout → Stripe → success page
- [ ] Verify order appears in `orders` collection in MongoDB
- [ ] Verify payment appears in `payments` collection in MongoDB
- [ ] **This must work before moving to Day 5**

---

## DAY 4 CHECKPOINT
Before sleeping, verify:
- [ ] Seller can add a product with a real image (stored in Firebase)
- [ ] Product appears on public listings page
- [ ] Buyer can click Buy Now → checkout → Stripe payment → success page
- [ ] Order and payment documents exist in MongoDB after payment
- [ ] At least 8 new meaningful commits today across client and server

---

---

# DAY 5
### Theme: Three Dashboards + Admin + Home Page
> Goal by midnight: All three dashboards have real data. Home page is complete. App looks like a product.

---

## SECTION G — Buyer Dashboard 🔴

### G1 — Dashboard Overview
- [ ] Route: `/dashboard/buyer`
- [ ] Summary cards (fetch real data):
  - [ ] Total Orders placed
  - [ ] Wishlist count
  - [ ] Recent Purchases (last 3 orders)
- [ ] **Commit:** `feat: buyer dashboard overview with summary cards`

### G2 — My Orders Page
- [ ] Route: `/dashboard/buyer/orders`
- [ ] Fetches all orders where `buyerInfo.userId` matches current user
- [ ] Table: product name, order status badge, payment status, order date, actions
- [ ] Cancel button visible only when status is `pending`
- [ ] Cancel → calls PATCH to update status to `cancelled`
- [ ] Order status badge colours: pending=yellow, accepted=blue, cancelled=red, delivered=green

### G3 — Wishlist Page
- [ ] Route: `/dashboard/buyer/wishlist`
- [ ] Add to Wishlist: pushes productId to user's wishlist array in DB
- [ ] Remove from Wishlist: pulls productId from array
- [ ] Wishlist page fetches product details for each saved productId
- [ ] Shows product cards with "Remove" and "View Details" buttons
- [ ] **Commit:** `feat: buyer orders and wishlist pages`

### G4 — Payment History Page
- [ ] Route: `/dashboard/buyer/payments`
- [ ] Fetches all payments where `buyerId` matches current user
- [ ] Table: transaction ID, amount, payment date, status badge
- [ ] **Commit:** `feat: buyer payment history page`

### G5 — Profile Settings Page
- [ ] Route: `/dashboard/buyer/profile`
- [ ] Pre-filled form with current user data
- [ ] Editable: name, phone, address, profile image (Firebase upload)
- [ ] Save → PATCH user document in DB
- [ ] **Commit:** `feat: buyer profile settings page`

---

## SECTION H — Seller Dashboard 🔴

### H1 — Dashboard Overview
- [ ] Route: `/dashboard/seller`
- [ ] Summary cards (real data):
  - [ ] Total Products listed
  - [ ] Total Sales (count of delivered orders)
  - [ ] Total Revenue (sum of delivered order amounts)
  - [ ] Pending Orders count
- [ ] **Commit:** `feat: seller dashboard overview with business stats`

### H2 — Manage Orders Page
- [ ] Route: `/dashboard/seller/orders`
- [ ] Fetches all orders where `sellerInfo.userId` matches current user
- [ ] Table: buyer name, product, amount, current status, action buttons
- [ ] Status update buttons:
  - Pending → Accept or Reject
  - Accepted → Processing
  - Processing → Shipped
  - Shipped → Delivered
- [ ] Each button click → PATCH order status in DB
- [ ] **Commit:** `feat: seller order management with status flow`

### H3 — Sales Analytics Page
- [ ] Route: `/dashboard/seller/analytics`
- [ ] Three Recharts charts (fake data is explicitly allowed by assignment):
  - [ ] Bar chart: Monthly Sales Trend (last 6 months)
  - [ ] Pie chart: Top Selling Categories
  - [ ] Line chart: Revenue Trend
- [ ] **Commit:** `feat: seller analytics page with recharts`

---

## SECTION I — Admin Dashboard 🔴

### I1 — Dashboard Overview
- [ ] Route: `/dashboard/admin`
- [ ] Summary cards (real data):
  - [ ] Total Users
  - [ ] Total Products
  - [ ] Total Orders
- [ ] **Commit:** `feat: admin dashboard overview`

### I2 — Manage Users Page
- [ ] Route: `/dashboard/admin/users`
- [ ] Backend: `GET /admin/users` (admin only) — returns all users
- [ ] Backend: `PATCH /admin/users/:id/status` — block/unblock
- [ ] Backend: `DELETE /admin/users/:id` — delete user
- [ ] Table: name, email, role badge, status badge, actions
- [ ] Search input: filter users by name or email (client-side filter is fine)
- [ ] Block/Unblock toggle button
- [ ] Delete button with confirmation dialog
- [ ] **Commit:** `feat: admin user management with block and delete`

### I3 — Manage Products Page
- [ ] Route: `/dashboard/admin/products`
- [ ] Backend: `GET /admin/products` (admin only) — returns all products
- [ ] Backend: `PATCH /admin/products/:id/status` — approve/reject
- [ ] Backend: `DELETE /admin/products/:id` — delete
- [ ] Table: image thumbnail, title, seller name, category, status, actions
- [ ] Approve / Reject / Delete buttons
- [ ] **Commit:** `feat: admin product moderation page`

### I4 — Manage Orders Page
- [ ] Route: `/dashboard/admin/orders`
- [ ] Backend: `GET /admin/orders` (admin only) — all orders
- [ ] Table: order ID, buyer, seller, amount, status, date
- [ ] Status update if needed
- [ ] **Commit:** `feat: admin order monitoring page`

### I5 — Platform Analytics Page
- [ ] Route: `/dashboard/admin/analytics`
- [ ] Four Recharts charts (fake data allowed):
  - [ ] Line chart: User Growth (last 6 months)
  - [ ] Bar chart: Monthly Orders
  - [ ] Pie chart: Category Performance
  - [ ] Bar chart: Top Categories
- [ ] **Commit:** `feat: admin platform analytics with recharts`

---

## SECTION J — Home Page 🟡

### J1 — Hero Section
- [ ] Attractive banner with headline and subheading
- [ ] CTA button ("Browse Listings" or "Start Selling")
- [ ] 3 statistics displayed: Total Products, Total Sellers, Total Buyers
- [ ] Framer Motion animation on hero text and CTA (fade in + slide up)
- [ ] **Commit:** `feat: hero section with statistics and framer motion`

### J2 — Featured Products Section
- [ ] Fetches latest 6-8 products from `GET /products`
- [ ] Product cards with: image, title, price, condition badge, category
- [ ] Framer Motion: cards animate in on scroll (stagger effect)
- [ ] "View All" button → goes to `/products`

### J3 — Popular Categories Section
- [ ] 6 category cards: Electronics, Furniture, Vehicles, Fashion, Mobile Phones, Other
- [ ] Each links to `/products?category=Electronics` etc.
- [ ] Icons or images per category

### J4 — Marketplace Statistics Section
- [ ] Total Products count (from DB)
- [ ] Total Sellers count (from DB)
- [ ] Total Buyers count (from DB)
- [ ] Completed Orders count (from DB)
- [ ] Framer Motion: count-up animation or fade-in

### J5 — Success Stories Section
- [ ] 3-4 static testimonial cards (buyer and seller stories)
- [ ] Name, photo placeholder, short quote, role badge

### J6 — Extra Sections (mandatory extras)
- [ ] Sustainability Impact section (static content, icons showing waste reduction stats)
- [ ] Trusted Sellers Showcase (show top 3-4 sellers from DB or static)
- [ ] **Commit:** `feat: home page all sections complete`

---

## DAY 5 CHECKPOINT
Before sleeping, verify:
- [ ] Buyer dashboard shows real order data
- [ ] Seller dashboard shows real product and order data
- [ ] Admin can block users and delete products
- [ ] Home page has all required sections
- [ ] Framer Motion is on at least hero section + product cards
- [ ] At least 10 new commits today across client and server

---

---

# DAY 6
### Theme: Polish + Challenges + Optional Features + Deployment Verification
> Goal by midnight: App is fully deployed, no CORS, no 404, no 504. README done. Commit count verified.

---

## SECTION K — Challenge Requirements

### K1 — Advanced Search & Sort (Challenge 1)
- [ ] Search bar on All Products page: filters by product name
- [ ] Category dropdown filter: filters by selected category
- [ ] Sort dropdown: Price Low→High, Price High→Low
- [ ] Backend: `GET /products?search=laptop&category=Electronics&sort=price_asc`
- [ ] Frontend: passes query params to API on every filter change
- [ ] **Commit:** `feat: product search, category filter, and price sorting`

### K2 — Pagination (Challenge 2)
- [ ] Backend: `GET /products` accepts `page` and `limit` query params
- [ ] Returns: `{ products, total, page, totalPages }`
- [ ] Frontend: pagination component on All Products page
- [ ] Shows current page, total pages, prev/next buttons
- [ ] **Commit:** `feat: pagination on all products page`

### K3 — JWT Verification (Challenge 3)
- [ ] Verify every private API route has `verifyToken` middleware
- [ ] Verify every role-restricted route has `requireRole` middleware
- [ ] Test with expired/invalid token → returns 403
- [ ] Test with wrong role → returns 403
- [ ] **Commit:** `feat: complete JWT verification on all private routes`

---

## SECTION L — Optional Features (Pick 2 minimum)

### L1 — Dark/Light Theme Toggle ✅ (RECOMMENDED — already partially done)
- [ ] Theme toggle button in navbar working
- [ ] Theme persists after page reload (cookie or localStorage via next-themes)
- [ ] All pages render correctly in both modes
- [ ] Shadcn components respect theme automatically
- [ ] **Commit:** `feat: dark light theme toggle with persistence`

### L2 — Recently Viewed Products ✅ (RECOMMENDED — cheapest to build)
- [ ] On product detail page load: push productId to a `recentlyViewed` array in localStorage
- [ ] Keep max 5 items, remove duplicates
- [ ] Show "Recently Viewed" section on home page or product listing page
- [ ] Fetch product details for stored IDs on component mount
- [ ] **Commit:** `feat: recently viewed products using local storage`

### L3 — 🟢 Advanced Filtering (if ahead of schedule)
- [ ] Price range slider (min/max)
- [ ] Condition filter checkboxes
- [ ] Location filter
- [ ] All filters work together with search

---

## SECTION M — Footer
- [ ] Footer component created
- [ ] Brand name + tagline
- [ ] Quick Links: Home, Products, Categories, About, Contact
- [ ] Contact info: email, phone, location
- [ ] Social media icons: Facebook, Twitter, Instagram, LinkedIn (links can be `#`)
- [ ] Copyright line: `© 2025 [AppName]. All rights reserved.`
- [ ] Responsive (stacks on mobile)
- [ ] **Commit:** `feat: footer with all required sections`

---

## SECTION N — Static Pages
- [ ] About Us page (`/about`) — company story, mission, team section (static content)
- [ ] Contact Us page (`/contact`) — contact form (no backend needed, static or EmailJS)
- [ ] Custom 404 page — illustration, message, "Back to Home" button
- [ ] Loading states — skeleton cards on product listing while fetching
- [ ] **Commit:** `feat: about, contact, 404, and loading skeleton pages`

---

## SECTION O — Deployment Verification 🔴
> Go through every item. Do not skip.

### O1 — Environment Variables
- [ ] Client: all env vars set in Vercel dashboard
- [ ] Server: all env vars set in Railway/Render dashboard
- [ ] No hardcoded URLs, keys, or secrets anywhere in the codebase
- [ ] Firebase keys in `.env.local` (client), not committed

### O2 — CORS Check
- [ ] Server `cors()` allows your exact deployed client URL
- [ ] No wildcard `*` in production CORS config
- [ ] Test from deployed client → deployed server: no CORS errors in browser console

### O3 — Route Check
- [ ] Visit every page from the deployed URL (not localhost)
- [ ] Reload every private route: still logged in, no redirect to login
- [ ] Visit a non-existent URL: custom 404 shows, not Next.js default
- [ ] Visit `/dashboard` while logged in: redirects correctly based on role
- [ ] Visit `/dashboard` while logged out: redirects to login

### O4 — 504 / 500 Check
- [ ] All API calls from deployed frontend reach deployed backend successfully
- [ ] No `504 Gateway Timeout` (usually means backend URL is wrong or server is sleeping on free tier)
- [ ] If using Render free tier: add a cron ping to keep server awake, or upgrade

### O5 — Console Check
- [ ] Open browser DevTools on deployed site
- [ ] No red errors in Console tab
- [ ] No failed network requests in Network tab
- [ ] No missing environment variable warnings

---

## SECTION P — README 🟡
- [ ] Project Name
- [ ] Project Purpose (2-3 sentences)
- [ ] Live URL (deployed client)
- [ ] Admin credentials (email + password for grader)
- [ ] Key Features (bullet list of 8-10 features)
- [ ] NPM Packages Used (both client and server)
- [ ] Tech Stack section
- [ ] **Commit:** `docs: complete readme with live url and admin credentials`

---

## DAY 6 CHECKPOINT
Before sleeping, verify:
- [ ] All three challenge requirements implemented
- [ ] Minimum 2 optional features done
- [ ] Footer on every page
- [ ] 404 page working
- [ ] App deployed, no CORS/404/504 errors
- [ ] README complete with live URL and admin credentials

---

---

# DAY 7 — BUFFER + COMMIT AUDIT
### Theme: Fix what broke. Count your commits. Submit.
> Do not add new features today. Only fix, polish, and verify.

---

## SECTION Q — Commit Count Audit 🔴
> Open both GitHub repos and count right now.

### Client Commits (need minimum 20)
- [ ] Count current commits: ___
- [ ] Commits needed: ___ more
- [ ] If short: make real commits for any uncommitted work (pages, components, styles)
- [ ] Check every commit message is descriptive (not "fix", "update", "changes")
  - ❌ Bad: `fix stuff`
  - ✅ Good: `fix: google oauth redirect premature success toast`

### Server Commits (need minimum 12)
- [ ] Count current commits: ___
- [ ] Commits needed: ___ more
- [ ] Check all server routes are committed with meaningful messages

---

## SECTION R — Final Bug Fix Pass

### R1 — Auth Edge Cases
- [ ] What happens if user signs up with Google but email already exists? Test it.
- [ ] What happens if JWT expires mid-session? Test it.
- [ ] What happens if a buyer tries to access `/dashboard/seller`? Test it.
- [ ] What happens if an unauthenticated user tries to access `/dashboard`? Test it.

### R2 — Payment Edge Cases
- [ ] What happens if user closes Stripe tab before completing payment? Order should NOT be created.
- [ ] What happens if user navigates directly to `/payment/success` without a valid session_id?
- [ ] What happens if the same session_id is submitted twice to `/payments/confirm`?

### R3 — UI Polish Pass
- [ ] All pages are responsive (test on mobile viewport in browser DevTools)
- [ ] No broken images
- [ ] No overflowing text or layout breaks
- [ ] All loading states show something (spinner or skeleton)
- [ ] All error states show something (toast or error message)
- [ ] Consistent heading style across all pages
- [ ] Consistent button style across all pages
- [ ] Dashboard sidebar is responsive (collapses on mobile)

---

## SECTION S — Final Submission Checklist
- [ ] Admin email noted: _____________________
- [ ] Admin password noted: _____________________
- [ ] Live client URL: _____________________
- [ ] GitHub client repo URL: _____________________
- [ ] GitHub server repo URL: _____________________
- [ ] Client commit count: _____ (must be ≥ 20)
- [ ] Server commit count: _____ (must be ≥ 12)
- [ ] README has live URL, admin credentials, key features, npm packages
- [ ] All environment variables confirmed in deployment dashboards
- [ ] One final smoke test: open incognito → register → browse → buy → check order in dashboard
- [ ] **Submitted ✅**

---

---

# QUICK REFERENCE — What Can Be Cut If Time Runs Out

| Feature | Safe to cut? | Why |
|---|---|---|
| Reviews collection | ✅ Yes | Not graded separately, no explicit checklist item |
| Seller verification badge (Optional 4) | ✅ Yes | Optional only |
| Product reporting system (Optional 5) | ✅ Yes | Optional only |
| About Us page content | 🟡 Partial | Page must exist, content can be minimal |
| Success Stories section | 🟡 Partial | Static content, 30 min max |
| Sales Analytics real data | 🟡 Partial | Assignment explicitly allows fake data |
| Platform Analytics real data | 🟡 Partial | Assignment explicitly allows fake data |
| Full 5-stage order status flow | 🟡 Partial | Pending→Accepted→Delivered is enough to pass |
| Pagination | 🔴 No | It's a Challenge requirement |
| Search and sort | 🔴 No | It's a Challenge requirement |
| JWT verification on routes | 🔴 No | It's a Challenge requirement |
| Stripe payment | 🔴 No | Core requirement |
| Three dashboards | 🔴 No | Core requirement |
| Role-based auth | 🔴 No | Core requirement |
| Framer Motion on hero + cards | 🔴 No | Explicitly required |

---

# COMMIT SCHEDULE (Target Distribution)

| Day | Client Commits | Server Commits | Running Total (C/S) |
|---|---|---|---|
| Day 1-2 (done) | ~4 | ~2 | 4 / 2 |
| Day 3 | 4 | 4 | 8 / 6 |
| Day 4 | 6 | 4 | 14 / 10 |
| Day 5 | 5 | 2 | 19 / 12 |
| Day 6 | 3 | 1 | 22 / 13 |
| Day 7 | 1 | 0 | 23 / 13 |

> Commit after every section, not at the end of the day.
> Small, focused commits are better than one giant commit per day.
