# 🛒 Kino – Second-Hand Marketplace Platform

**🔗 Live Site:** [kinomarkt.vercel.app](https://kinomarkt.vercel.app/)
**📂 Repository:** [github.com/Shakawat-Sadik/Kino.com](https://github.com/Shakawat-Sadik/Kino.com)

<!-- Add a screenshot of the homepage here, e.g.: -->
<!-- ![Kino homepage](public/screenshot.png) -->

---

## 🎯 About Kino

**Kino** is a full-stack second-hand marketplace where users can **buy, sell, and manage pre-owned products** securely. Built with **Next.js**, **BetterAuth**, **Stripe**, and **MongoDB**, it offers role-based dashboards, product search & filtering, and a seamless checkout experience.

🔹 **Inspired by:** Bikroy, Facebook Marketplace, eBay, OLX
🔹 **Purpose:** Reduce waste, promote sustainability, and enable affordable shopping.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Multi-provider login** – Email/password + Google OAuth via BetterAuth
- **Role-based access** – `buyer`, `seller`, and `admin` roles, each with dedicated dashboards
- **Protected routes** – Private pages (dashboard, orders, checkout) guarded via middleware/proxy

### 🛍️ Marketplace Core
- **Product management** – Sellers can add, edit, and delete listings with images (Cloudinary)
- **Search, filter & sort** – Browse by category, sort by price
- **Product details** – Full listing info with images, seller info, condition, and price
- **Wishlist** – Buyers can save products for later

### 💳 Payments (Stripe)
- **Secure checkout** – Stripe Checkout Session for one-click payments
- **Payment success page** – Order confirmation after transaction
- **Order status tracking** – From placed order through delivery
- **Payment history** – Buyers can review past transactions

### 📊 Role-Based Dashboards
| Role       | Features                                                              |
|------------|------------------------------------------------------------------------|
| **Buyer**  | Orders, Wishlist, Payment History, Profile Management                  |
| **Seller** | Products, Sales Analytics (Recharts), Order Management                 |
| **Admin**  | User Management, Product Approval, Platform Analytics                  |

### 🎨 UI/UX
- **Modern design** – Radix UI / Shadcn-style components + Tailwind CSS v4
- **Animations** – Motion (Framer Motion) on hero sections and cards
- **Responsive** – Mobile, tablet, and desktop layouts
- **Dark/Light theme toggle** via `next-themes`

---

## 🛠 Tech Stack

| Category            | Technologies                                                        |
|----------------------|-----------------------------------------------------------------------|
| **Framework**        | Next.js 16 (App Router), React 19                                    |
| **Styling**          | Tailwind CSS v4, Radix UI, Lucide Icons                              |
| **Animation**        | Motion, Lenis (smooth scroll)                                        |
| **Auth**              | BetterAuth (email/password + Google OAuth), MongoDB adapter          |
| **Database**          | MongoDB                                                              |
| **Image Storage**    | Cloudinary                                                            |
| **Payments**          | Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js`)              |
| **Charts**            | Recharts                                                              |
| **Deployment**        | Vercel                                                                |
| **Package Manager**  | pnpm                                                                  |

### Key Dependencies
`next`, `react` / `react-dom`, `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `stripe` client SDKs, `cloudinary`, `recharts`, `motion`, `lenis`, `radix-ui`, `lucide-react`, `next-themes`, `sonner`, `embla-carousel-react`, `react-day-picker`, `date-fns`, `cmdk`, `vaul`

---

## 🔧 Project Structure

```
kino.com/
├── src/
│   ├── app/              # App Router — pages & API routes
│   │   ├── auth/         # Login, sign-up, admin login
│   │   ├── dashboard/    # Role-based dashboards (buyer/seller/admin)
│   │   ├── products/     # Product listing & details
│   │   ├── categories/   # Category browsing
│   │   ├── checkout/     # Stripe checkout flow
│   │   ├── payment-success/
│   │   └── api/          # API routes (auth, cloudinary, etc.)
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, auth & DB configs
│   └── proxy.js          # Route protection
└── public/                # Static assets
```

This is a single Next.js application (frontend + API routes together) — there is no separate backend repo.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- MongoDB database (e.g. MongoDB Atlas)
- Stripe account (test mode)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Shakawat-Sadik/Kino.com.git
   cd Kino.com
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root with the required variables for MongoDB, BetterAuth (including Google OAuth credentials), Stripe, and Cloudinary.

4. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📎 Resources

- **Live Site:** https://kinomarkt.vercel.app/
- **Repository:** https://github.com/Shakawat-Sadik/Kino.com
