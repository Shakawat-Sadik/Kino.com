"use client";
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { createPaymentIntent, confirmPayment } from "@/lib/action/action";
import { StatefulButton } from "@/components/motion/button/stateful";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#09090b",
      fontFamily: "inherit",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#a1a1aa" },
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
};

export default function CheckoutForm({ product }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [payState, setPayState] = useState("idle");
  const [error, setError] = useState(null);

  const fail = (msg) => {
    setError(msg);
    setPayState("error");
    setTimeout(() => setPayState("idle"), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || payState === "loading") return;

    setPayState("loading");
    setError(null);

    // 1. Create PaymentIntent on the server
    const intentRes = await createPaymentIntent({
      amount: product.price,
      productId: product._id,
      productTitle: product.title,
    });
    if (!intentRes.success) return fail(intentRes.message);

    // 2. Confirm card payment client-side via Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      intentRes.result.clientSecret,
      { payment_method: { card: elements.getElement(CardElement) } }
    );
    if (stripeError) return fail(stripeError.message);

    // 3. Save payment + create order on the server
    const confirmRes = await confirmPayment({
      transactionId: paymentIntent.id,
      productId: product._id,
      sellerEmail: product.sellerEmail,
      amount: product.price,
      productTitle: product.title,
    });
    if (!confirmRes.success) return fail(confirmRes.message);

    // 4. Success — redirect to payment history with full details for success card
    setPayState("success");
    const params = new URLSearchParams({
      success: "true",
      orderId: confirmRes.result.orderId ?? "",
      transactionId: paymentIntent.id ?? "",
      amount: String(product.price),
      productTitle: product.title,
    });
    setTimeout(() => {
      router.push(`/dashboard/buyer/payments?${params.toString()}`);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Card details</label>
        <div className="rounded-lg border border-border bg-white px-3 py-3.5">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-muted-foreground">
          Test card: 4242 4242 4242 4242 · any future date · any CVC
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 leading-relaxed">
          {error}
        </p>
      )}

      <Separator />

      <StatefulButton
        type="submit"
        state={payState}
        className="w-full"
        disabled={!stripe || !elements}
        loadingText="Processing"
        successText="Payment successful!"
        errorText="Try again"
        icon={<Lock className="h-3.5 w-3.5" />}
      >
        Pay ৳ {product.price.toLocaleString()}
      </StatefulButton>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secured by Stripe · Your card is never stored
      </p>
    </form>
  );
}
