// components/auth/RoleGuard.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function RoleGuard({ allowedRoles, children }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return; // not ready yet, do nothing

    if (!session?.user) {
      // Not logged in at all
      router.replace("/auth/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      // Logged in but wrong role
      router.replace("/unauthorized");
    }
  }, [session, isPending, router, allowedRoles]);

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  // Not authed or wrong role — render nothing while redirect happens
  if (!session?.user) return null;
  if (allowedRoles && !allowedRoles.includes(session.user.role)) return null;

  // Correct user — render children
  return children;
}