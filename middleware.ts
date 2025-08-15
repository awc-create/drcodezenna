import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // 1) Redirect main-domain /admin → admin subdomain
  if (url.pathname.startsWith("/admin") && url.hostname !== "admin.drcodezenna.com") {
    const target = new URL(req.url);
    target.hostname = "admin.drcodezenna.com"; // preserve https + path + query
    return NextResponse.redirect(target);
  }

  // 2) Gate anything under /admin *on the admin host*
  if (url.hostname === "admin.drcodezenna.com" && url.pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // must be signed in
    if (!token) {
      const signin = new URL("/auth/signin", url.origin); // we'll create this page below
      signin.searchParams.set("callbackUrl", url.href);
      return NextResponse.redirect(signin);
    }

    // must be admin
    if ((token as any).role !== "admin") {
      return NextResponse.rewrite(new URL("/403", url.origin));
    }
  }

  return NextResponse.next();
}

// Only run on /admin routes (don’t intercept NextAuth/api/_next assets)
export const config = {
  matcher: ["/admin/:path*"],
};
