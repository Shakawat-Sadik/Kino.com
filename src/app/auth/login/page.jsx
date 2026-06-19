"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { sonnerFunctionality } from "@/lib/sonnerFunctionality";
import { eliteDateFormat } from "@/lib/utils";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  console.log("What is the search params?", searchParams.toString());
  console.log("Redirect after login:", redirect);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      toast.error("Login Failed", {
        description: error.message || eliteDateFormat(),
      });
      setLoading(false);
    } else {
      toast.success("Login Successful!", sonnerFunctionality(LogIn));
      router.push(redirect);
      router.refresh();
    }
  };

  const handleGoogle = async () => {
    setSocialLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: redirect,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 md:py-14 lg:py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Login to access your dashboard</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={handleGoogle}
          disabled={socialLoading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11v2.4h3.3c-.13.75-.92 2.2-3.3 2.2c-1.99 0-3.6-1.64-3.6-3.6s1.61-3.6 3.6-3.6c1.13 0 1.88.48 2.32.89l1.58-1.52C13.93 6.55 12.78 6 11.1 6C7.93 6 5.36 8.57 5.36 11.75s2.57 5.75 5.75 5.75c3.32 0 5.52-2.33 5.52-5.61c0-.38-.04-.67-.09-.96H12z"/></svg>
          Continue with Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required placeholder="******" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}