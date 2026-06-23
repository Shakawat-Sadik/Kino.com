"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { sonnerFunctionality } from "@/lib/sonnerFunctionality";
import { eliteDateFormat } from "@/lib/utils";
import { StatefulButton } from "@/components/motion/button/stateful";
import { Info, LogIn, Eye, EyeClosed } from "lucide-react";

const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState("idle");
  const [showPass, setShowPass] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error } = await authClient.signIn.email({ email, password });
    console.log(data);

    if (error) {
      toast.error("Login Failed", {
        description: error.message || eliteDateFormat(),
      });
      setLoading(false);
    } else {
      toast.success("Login Successful!", sonnerFunctionality(LogIn));
      router.push(redirect);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setButtonState("loading");
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirect,
      },
      {
        onSuccess() {
          toast.success("Login Successful!", sonnerFunctionality());
          setButtonState("success");
          setTimeout(() => setButtonState("idle"), 2000);
          router.push(redirect);
        },
        onError(ctx) {
          toast.error("Login Failed", {
            description: `${ctx.error.message} | 
            ${eliteDateFormat()}`,
          });
          setButtonState("error");
          setTimeout(() => setButtonState("idle"), 2000);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 md:py-14 lg:py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Login to access your dashboard
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <StatefulButton
          state={buttonState}
          loadingText="Logging in with Google..."
          successText="Logged in with Google"
          errorText="Something went wrong"
          // icon={<LogIn size={16} />}
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={buttonState === "loading"}
        >
          <div className="flex justify-center items-end gap-1">
            <GoogleIcon />
            <span className="font-bold">Continue with Google</span>
          </div>
        </StatefulButton>

        <div className="text-xs flex justify-center items-center gap-2">
          <Info />
          <div className="flex flex-col items-start gap-1 text-xs opacity-75">
            <span className="opacity-50">
              If you wanna sell, then <span className="font-bold">register</span> as a seller for first time.
            </span>
            <span className="opacity-50">
              Or change the role in your profile after <span className="font-bold">Google</span> sign-in!
            </span>
          </div>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                required
                placeholder={showPass ? "your password" : "••••••"}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <Eye size={15} /> : <EyeClosed size={15} />}
              </button>
            </div>
          </div>


          <StatefulButton
            type="submit"
            state={loading ? "loading" : "idle"}
            loadingText="Logging in..."
            successText="Welcome back!"
            errorText="Check credentials & try again"
            icon={<LogIn size={16} />}
            className="w-full"
            disabled={loading}
          >
            Login
          </StatefulButton>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="text-primary font-semibold hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
