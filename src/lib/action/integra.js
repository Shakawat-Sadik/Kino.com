"use server";

import { headers } from "next/headers";

/**
 * getAuthHeaders
 *
 * Fetches the BetterAuth JWT token from the /api/auth/token endpoint.
 * Called server-side only — uses the incoming request headers so BetterAuth
 * can read the session cookie and return a signed JWT for that user.
 *
 * Returns the raw token string, or null if the user is not authenticated.
 */
export default async function getAuthHeaders() {
  try {
    const incomingHeaders = await headers();
    const cookie = incomingHeaders.get("cookie");
    // console.log("[getAuthHeaders] cookie present:", !!cookie); //double !! makes it a boolean from positive direction
    // console.log("[getAuthHeaders] cookie value:", cookie?.slice(0, 80));

    if (!cookie) return null;

    const baseURL =
      process.env.NODE_ENV === "production"
        ? process.env.REMOTE_CLIENTSIDE_BETTER_AUTH_URL : process.env.BETTER_AUTH_URL
        || "http://localhost:3000";

    const res = await fetch(`${baseURL}/api/auth/token`, {
      headers: {
        Cookie: cookie,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    // BetterAuth JWT plugin returns { token: "..." }
    return data?.token ?? null;
  } catch (err) {
    console.error("[getAuthHeaders] Failed to fetch token:", err.message);
    return null;
  }
}
