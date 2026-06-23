// app/auth/admin/page.jsx  ← unlisted, never linked from public UI
import AdminLoginForm from "@/components/All/Login/AdminLoginForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  // If already logged in as admin, go straight to dashboard
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role === "admin") {
    redirect("/dashboard/admin");
  }
  // If logged in but NOT admin, send to their own dashboard silently
  // Don't reveal that an admin panel exists
  if (session?.user) {
    redirect("/dashboard");
  }

  return <AdminLoginForm />;
}