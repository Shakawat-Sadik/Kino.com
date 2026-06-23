import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

export const proxy = async (request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const redirectUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
};


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add-product",
    "/my-products/:path*",
    "/my-orders/:path*",
    "/wishlist/:path*",
    "/profile/:path*",
    "/reviews"
  ],
};

/*
import { NextResponse } from "next/server"
import { auth } from "./lib/auth"
import { headers } from "next/headers";

export const proxy = async (request) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session){
        const pathname = request.nextUrl.pathname;
        pathname.startsWith("/api") && pathname.replace("/api/", "/auth/login");
        /*
        alternatively,
        pathname.startsWith("/api") && NextResponse.json({ success: false, error: "Access not authenticated", result: null }, { status: 401 });
        but for now, let's just redirect to login for all protected routes, including API routes.
        */
//         const redirectUrl = new URL(`/auth/login`, request.url);
//         return NextResponse.redirect(redirectUrl);
//     }

//     return NextResponse.next();
// }


// export const config = {
//     matcher: ["/add-product", "/my-products", "/my-products/", "/wishlist", "/profile", "/profile/", "/dashboard", "/admin/:path*", "/api/:path*"],
// }

// */