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
import { UserPlus } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StatefulButton } from "@/components/motion/button/stateful";
import { Eye } from "lucide-react";
import { EyeClosed } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [buttonState, setButtonState] = useState("idle");
  const [showPass, setShowPass] = useState(false);
  const [userName, setUserName] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonState("loading");
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name.value;
    const image = e.target.image.value || "";
    const role = e.target.role.value;

    // Assignment Password Validation
    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password)
    ) {
      toast.error("Invalid Password", {
        description: "Min 6 chars, 1 uppercase, 1 lowercase.",
      });
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
      setLoading(false);
      return;
    }

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      role,
      image,
    });
    console.log(data);
    setUserName(data?.name);

    if (error) {
      toast.error("Registration Failed", {
        description: error.message || eliteDateFormat(),
      });
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
      setLoading(false);
    } else {
      toast.success("Account Created!", sonnerFunctionality(UserPlus));
      // Assignment says: "On successful registration: Redirect user to Login page"
      setButtonState("success");
      setTimeout(() => setButtonState("idle"), 2000);
      router.push("/auth/login");
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
        <h1 className="text-3xl font-black text-foreground">Create Account</h1>
        <p className="text-muted-foreground mt-2">
          Join <span className="text-chart-3">Kino.com</span> today
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleGoogle}
          disabled={socialLoading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 11v2.4h3.3c-.13.75-.92 2.2-3.3 2.2c-1.99 0-3.6-1.64-3.6-3.6s1.61-3.6 3.6-3.6c1.13 0 1.88.48 2.32.89l1.58-1.52C13.93 6.55 12.78 6 11.1 6C7.93 6 5.36 8.57 5.36 11.75s2.57 5.75 5.75 5.75c3.32 0 5.52-2.33 5.52-5.61c0-.38-.04-.67-.09-.96H12z"
            />
          </svg>
          Sign up with Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Your full name"
            />
          </div>
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
            <Label htmlFor="image">Photo URL (Optional)</Label>
            <Input
              id="image"
              name="image"
              type="url"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="relative space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              {/* <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link> */}
            </div>
            <Input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              required
              placeholder={!showPass ? "******" : "password"}
            />
            <div
              onClick={() => setShowPass(!showPass)}
              className="absolute top-7 right-2"
            >
              {showPass ? (
                <Eye size={16} className=" pointer-cursor" />
              ) : (
                <EyeClosed size={16} className=" pointer-cursor" />
              )}
            </div>
          </div>

          <Label htmlFor="role" className="">
            Role
          </Label>
          <RadioGroup
            name="role"
            defaultValue="buyer"
            className="w-full p-2 rounded-md bg-popover border border-border"
          >
            <Field orientation="horizontal">
              <RadioGroupItem value="buyer" id="buyer" />
              <FieldContent>
                <FieldLabel htmlFor="buyer">Buyer.</FieldLabel>
                <FieldDescription>
                  Buy pre-owned items from sellers.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="seller" id="seller" />
              <FieldContent>
                <FieldLabel htmlFor="seller">Seller</FieldLabel>
                <FieldDescription>
                  Find buyers for your unused items.
                </FieldDescription>
              </FieldContent>
            </Field>
          </RadioGroup>

          <StatefulButton
            type="submit"
            state={loading ? "loading" : "idle"}
            loadingText="Creating account..."
            successText={
              userName
                ? `Welcome, ${userName.split(" ")[0]}!`
                : "Account Created!"
            }
            // successText="Account Created!"
            errorText="Something went wrong"
            icon={<UserPlus size={16} />}
            className="w-full rounded-xl"
            disabled={loading}
          >
            Register
          </StatefulButton>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
