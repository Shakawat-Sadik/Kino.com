# Stripe Payment Integration — A to Z
**Project: Kino.com (ReSell Hub)**
Stack: Next.js 16 · Express 5 (ESM) · MongoDB · BetterAuth · Server Actions

---

## Overview of the Payment Flow

```
Buyer clicks "Pay"
  → Next.js Server Action calls Express POST /payments/create-intent
  → Express creates a Stripe PaymentIntent → returns { clientSecret }
  → Client uses @stripe/react-stripe-js to render CardElement
  → Buyer enters card details → stripe.confirmCardPayment(clientSecret)
  → On success → Server Action calls Express POST /payments/confirm
  → Express saves payment record + creates order in MongoDB
  → Client redirects to /dashboard/buyer/payments?success=true
```

---

## Step 1 — Get Stripe API Keys

1. Go to https://dashboard.stripe.com/register and create an account.
2. In the dashboard, go to **Developers → API Keys**.
3. Copy:
   - **Publishable key** — starts with `pk_test_...`
   - **Secret key** — starts with `sk_test_...`

---

## Step 2 — Install Packages

**Server** (`Kino_ServerSide/`):
```bash
pnpm add stripe
```

**Client** (`kino.com/`):
```bash
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

---

## Step 3 — Environment Variables

**Server** — add to `Kino_ServerSide/.env`:
```env
STRIPE_SECRET_KEY=<your_stripe_secret_key_here>
```

**Client** — add to `kino.com/.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

> The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

---

## Step 4 — Server: Add Stripe Routes to `index.js`

Add this import at the top of `Kino_ServerSide/index.js` (after existing imports):

```js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### Route A — Create Payment Intent

Add before the server listen call:

```js
// POST /payments/create-intent
// Protected: buyer must be logged in
// Body: { amount: number (in smallest currency unit, e.g. cents), productId, productTitle }
app.post("/payments/create-intent", verifyToken, buyerGuard, async (req, res) => {
  try {
    const { amount, productId, productTitle } = req.body;

    if (!amount || !productId) {
      return res.status(400).json({ success: false, message: "amount and productId are required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in paisa/cents
      currency: "bdt",                  // change to "usd" if needed
      metadata: {
        productId,
        productTitle,
        buyerEmail: req.user.email,
      },
    });

    res.status(200).json({
      success: true,
      result: { clientSecret: paymentIntent.client_secret },
    });
  } catch (e) {
    console.error("Stripe create-intent error:", e);
    res.status(500).json({ success: false, message: "Failed to create payment intent" });
  }
});
```

### Route B — Confirm & Save Payment (called after Stripe succeeds on client)

```js
// POST /payments/confirm
// Protected: buyer must be logged in
// Body: { transactionId, productId, sellerEmail, amount, productTitle }
app.post("/payments/confirm", verifyToken, buyerGuard, async (req, res) => {
  try {
    const { transactionId, productId, sellerEmail, amount, productTitle } = req.body;

    if (!transactionId || !productId) {
      return res.status(400).json({ success: false, message: "transactionId and productId are required" });
    }

    // Verify the payment intent actually succeeded with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Payment not confirmed by Stripe" });
    }

    const buyer = req.dbUser;
    const productsCol = req.db.collection("products");
    const ordersCol = req.db.collection("orders");
    const paymentsCol = req.db.collection("payments");

    const product = await productsCol.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const now = new Date();

    // 1. Create the order
    const order = {
      buyerInfo: {
        userId: buyer._id.toString(),
        name: buyer.name,
        email: buyer.email,
      },
      sellerInfo: {
        email: product.sellerEmail,
        name: product.sellerName,
      },
      sellerEmail: product.sellerEmail,
      productId,
      productTitle: product.title,
      totalAmount: amount,
      orderStatus: "pending",
      paymentStatus: "paid",
      createdAt: now,
      updatedAt: now,
    };
    const orderResult = await ordersCol.insertOne(order);

    // 2. Save payment record
    const payment = {
      transactionId,
      orderId: orderResult.insertedId.toString(),
      productId,
      buyerEmail: buyer.email,
      sellerEmail: product.sellerEmail,
      amount,
      paymentStatus: "success",
      paymentMethod: "stripe",
      createdAt: now,
    };
    await paymentsCol.insertOne(payment);

    // 3. Mark product as sold (optional — remove if you allow multiple sales)
    await productsCol.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { status: "sold", updatedAt: now } }
    );

    res.status(201).json({
      success: true,
      message: "Order and payment saved",
      result: { orderId: orderResult.insertedId },
    });
  } catch (e) {
    console.error("Stripe confirm error:", e);
    res.status(500).json({ success: false, message: "Failed to save payment" });
  }
});
```

---

## Step 5 — Add Public Stats Route to `index.js` (Home Page)

```js
// GET /stats — public marketplace statistics for home page
app.get("/stats", async (req, res) => {
  try {
    const usersCol = req.db.collection("user");
    const productsCol = req.db.collection("products");
    const ordersCol = req.db.collection("orders");

    const totalProducts = await productsCol.countDocuments();
    const totalSellers = await usersCol.countDocuments({ role: "seller" });
    const totalBuyers = await usersCol.countDocuments({ role: "buyer" });
    const completedOrders = await ordersCol.countDocuments({ orderStatus: "delivered" });

    res.status(200).json({
      success: true,
      result: { totalProducts, totalSellers, totalBuyers, completedOrders },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});
```

---

## Step 6 — Fix Pagination Bug on `GET /products`

The current `/products` route ignores the `page` param. Fix in `index.js`:

```js
app.get("/products", async (req, res) => {
  try {
    const productsCol = req.db.collection("products");
    const { sort, order, search, category, status, condition } = req.query;
    const { page, limit, skip } = parsePagination(req.query); // use parsePagination

    const filter = {};
    if (search) filter.title = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (condition) filter.condition = condition;

    const sortObj = {};
    if (sort) {
      const direction = order === "desc" ? -1 : 1;
      if (sort === "price") sortObj.price = direction;
      if (sort === "dateUploaded") sortObj.dateUploaded = direction;
    }

    const result = await productsCol
      .find(filter)
      .sort(sortObj)
      .skip(skip)          // ← was missing
      .limit(limit)
      .toArray();

    const total = await productsCol.countDocuments(filter); // ← was missing

    res.status(200).json({
      success: true,
      message: "Products loaded successfully",
      result,
      total,               // ← needed for pagination controls
      page,
      limit,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to load products" });
  }
});
```

---

## Step 7 — Add Actions to `action.js`

Open `src/lib/action/action.js` and add these functions at the bottom:

```js
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
  return await fetchAPI("/payments/confirm", {
    method: "POST",
    body: JSON.stringify({ transactionId, productId, sellerEmail, amount, productTitle }),
  });
}

// ─────────────────────────────────────────────────────────────
// PUBLIC STATS (Home Page)
// Express route: GET /stats
// ─────────────────────────────────────────────────────────────

export async function getMarketplaceStats() {
  return await fetchAPI("/stats");
}
```

---

## Step 8 — Create the Checkout Page

Create file: `src/app/dashboard/buyer/checkout/[productId]/page.jsx`

```jsx
"use client";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { getProductById } from "@/lib/action/action";
import CheckoutForm from "@/components/All/payment/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage({ params }) {
  const { productId } = params;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    getProductById(productId).then((res) => {
      if (res.success) setProduct(res.result);
    });
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="mb-6 border rounded p-4">
        <p className="font-medium">{product.title}</p>
        <p className="text-lg font-bold mt-1">৳ {product.price}</p>
        <p className="text-sm text-gray-500">{product.condition} · {product.category}</p>
      </div>
      <Elements stripe={stripePromise}>
        <CheckoutForm product={product} />
      </Elements>
    </div>
  );
}
```

---

## Step 9 — Create the CheckoutForm Component

Create file: `src/components/All/payment/CheckoutForm.jsx`

```jsx
"use client";
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { createPaymentIntent, confirmPayment } from "@/lib/action/action";

export default function CheckoutForm({ product }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // 1. Create PaymentIntent on the server
    const intentRes = await createPaymentIntent({
      amount: product.price,
      productId: product._id,
      productTitle: product.title,
    });

    if (!intentRes.success) {
      setError(intentRes.message);
      setLoading(false);
      return;
    }

    // 2. Confirm the card payment on the client via Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      intentRes.result.clientSecret,
      { payment_method: { card: elements.getElement(CardElement) } }
    );

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    // 3. Tell our server to save the payment and create the order
    const confirmRes = await confirmPayment({
      transactionId: paymentIntent.id,
      productId: product._id,
      sellerEmail: product.sellerEmail,
      amount: product.price,
      productTitle: product.title,
    });

    if (!confirmRes.success) {
      setError(confirmRes.message);
      setLoading(false);
      return;
    }

    // 4. Redirect to success
    router.push(`/dashboard/buyer/payments?success=true&orderId=${confirmRes.result.orderId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded p-4">
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <CardElement
          options={{
            style: {
              base: { fontSize: "16px", color: "#1a1a1a" },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-blue-600 text-white py-3 rounded font-medium disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ৳ ${product.price}`}
      </button>
    </form>
  );
}
```

---

## Step 10 — Fix `front-action.js` Mismatch

`front-action.js:312` calls a non-existent route. Fix it:

```js
// front-action.js — line 312
// BEFORE:
return await fetchAPI("/admin/stats/summary")
// AFTER:
return await fetchAPI("/admin/analytics/summary")
```

---

## Step 11 — Test Cards (Stripe Test Mode)

| Scenario | Card Number | Expiry | CVC |
|---|---|---|---|
| Success | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Decline | `4000 0000 0000 0002` | Any future date | Any 3 digits |
| Auth required | `4000 0025 0000 3155` | Any future date | Any 3 digits |

---

## Step 12 — Go Live Checklist

- [ ] Replace `pk_test_` and `sk_test_` keys with live keys from Stripe dashboard
- [ ] Set `currency` to the correct value (`bdt`, `usd`, etc.)
- [ ] Remove all `console.log` debug statements from `index.js`
- [ ] Ensure `STRIPE_SECRET_KEY` is set in Vercel/Railway environment variables
- [ ] Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in Vercel environment variables
- [ ] Test the full checkout flow on the live URL before submission
