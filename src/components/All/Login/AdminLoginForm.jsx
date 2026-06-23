// components/All/Login/AdminLoginForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { eliteDateFormat } from "@/lib/utils";
import { ShieldCheck, Eye, EyeClosed } from "lucide-react";
import { StatefulButton } from "@/components/motion/button/stateful";

export default function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error } = await authClient.signIn.email({ email, password });

    if (error) {
      // Generic error — don't reveal whether the account exists
      toast.error("Authentication failed", {
        description: eliteDateFormat(),
      });
      setLoading(false);
      return;
    }

    // Verify the returned user is actually admin
    // BetterAuth returns the user object after signIn
    if (data?.user?.role !== "admin") {
      // Someone with a valid account tried to access this page
      // Sign them back out silently and show generic error
      await authClient.signOut();
      toast.error("Authentication failed", {
        description: eliteDateFormat(),
      });
      setLoading(false);
      return;
    }

    // Genuine admin — proceed
    router.push("/dashboard/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* No logo, no app name, no links — nothing that reveals context */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 text-primary p-3 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
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
                  autoComplete="current-password"
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
              loadingText="Authenticating..."
              icon={<ShieldCheck size={16} />}
              className="w-full"
              disabled={loading}
            >
              Authenticate
            </StatefulButton>
          </form>
        </div>

        {/* No "register" link, no "forgot password", no Google OAuth */}
        {/* No navigation back to the main site from here */}

      </div>
    </div>
  );
}