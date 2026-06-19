# **🛒 Kino – Second-Hand Marketplace Platform**

**🔗 Live Site:** [Add your Vercel/Netlify URL here]
**📂 Client Repo:** [Add client GitHub link]
**📂 Server Repo:** [Add server GitHub link]

---

## **🎯 About Kino**
**Kino** is a **full-stack second-hand marketplace** where users can **buy, sell, and manage pre-owned products** securely. Built with **Next.js**, **BetterAuth (JWT)**, **Stripe**, and **MongoDB**, it offers role-based dashboards, advanced search, and a seamless payment experience.

🔹 **Inspired by:** Bikroy, Facebook Marketplace, eBay, OLX
🔹 **Purpose:** Reduce waste, promote sustainability, and enable affordable shopping.

---

---

## **✨ Key Features**

### **🔐 Authentication & Authorization**
✅ **Multi-Provider Login** – Email/Password + Google OAuth (BetterAuth)
✅ **JWT Token Verification** – Secure API routes with role-based access (`buyer`, `seller`, `admin`)
✅ **Protected Routes** – Private pages (Dashboard, Orders, Products) with middleware

### **🛍️ Marketplace Core**
✅ **Product Management** – Sellers can **add/edit/delete** products with images (Firebase Storage)
✅ **Advanced Search & Sorting** – Filter by **name, category**, sort by **price (low-high, high-low)**
✅ **Pagination** – Smooth browsing on **All Products** page
✅ **Product Details** – Full info with images, seller contact, condition, price
✅ **Wishlist** – Save products for later

### **💳 Payment System (Stripe Integration)**
✅ **Secure Checkout** – Stripe Checkout Session for one-click payments
✅ **Payment Success/Failure Pages** – Order confirmation with transaction ID
✅ **Payment History** – Track all transactions (buyer & admin view)
✅ **Order Status Tracking** – `Pending → Accepted → Processing → Shipped → Delivered`

### **📊 Role-Based Dashboards**
   Role      | Features                                                                 |
 |-----------|--------------------------------------------------------------------------|
 | **Buyer** | Orders, Wishlist, Payment History, Profile Management                   |
 | **Seller**| Products, Sales Analytics (Recharts), Order Management, Revenue Stats |
 | **Admin** | User Management (Block/Unblock), Product Approval, Platform Analytics |

### **🎨 UI/UX Highlights**
✅ **Modern Design** – Shadcn/UI + Tailwind CSS
✅ **Animations** – Framer Motion on Hero, Product Cards, Stats
✅ **Responsive** – Mobile, Tablet, Desktop
✅ **Dark/Light Theme Toggle** *(Optional Feature #1)*
✅ **Recently Viewed Products** *(Optional Feature #2)*

### **📈 Analytics (Fake Data)**
✅ **Seller Dashboard** – Sales charts, monthly trends, top products
✅ **Admin Dashboard** – User growth, category performance, orders

---

---
## **🛠 Tech Stack**
 | Category       | Technologies                                                                 |
 |----------------|-----------------------------------------------------------------------------|
 | **Frontend**   | Next.js (App Router), React, TypeScript, Shadcn/UI, Framer Motion, Recharts |
 | **Backend**    | Next.js API Routes, BetterAuth (JWT), MongoDB (Mongoose)                   |
 | **Database**   | MongoDB Atlas (Cloud)                                                        |
 | **Storage**    | Firebase Storage (Product Images)                                          |
 | **Payments**   | Stripe (Test Mode)                                                          |
 | **Deployment** | Vercel (Frontend), MongoDB Atlas, Firebase Storage                         |
 | **Package Manager** | pnpm                                                                     |


## **🔧 Project Structure**

kino.com/
├── client/               # Next.js Frontend
│   ├── app/              # App Router (pages + API routes)
│   │   ├── (auth)/       # Login, Register
│   │   ├── (dashboard)/  # Role-based dashboards
│   │   ├── products/     # All Products, Details
│   │   └── api/          # Frontend API routes
│   ├── components/       # Reusable UI (Shadcn)
│   ├── lib/              # Utilities, Firebase/Stripe configs
│   └── styles/           # Global CSS
│
├── server/               # Backend (if separated)
│   ├── models/           # MongoDB Schemas
│   ├── routes/           # API Endpoints
│   └── middleware/       # Auth, Role Checks
│
└── README.md             # This file
---

---
## **🚀 Getting Started**

### **Prerequisites**
- Node.js (v18+)
- pnpm (v8+)
- MongoDB Atlas Account
- Stripe Test Account
- Firebase Project (for Storage)

### **Installation**
1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/kino-client.git
   cd kino-client