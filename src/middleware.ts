// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const MAIN = "drcodezenna.com";
const ADMIN = "admin.drcodezenna.com";

// Prefer x-forwarded-host and strip :port
function getCleanHost(req: NextRequest): string {
  const xfHost = req.headers.get("x-forwarded-host");
  const host = (xfHost || req.headers.get("host") || "").toLowerCase();
  return host.split(":")[0];
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const host = getCleanHost(req);

  // Allow sign-in and 403 on admin host to avoid loops
  if (host === ADMIN && (pathname.startsWith("/auth/signin") || pathname === "/403")) {
    return NextResponse.next();
  }

  // admin.drcodezenna.com → /admin
  if (host === ADMIN && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", url.origin), { status: 308 });
  }

  // Block /admin on MAIN → send home
  if ((host === MAIN || host === `www.${MAIN}`) && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(`https://${MAIN}/`), { status: 308 });
  }

  // Gate /admin on ADMIN
  if (host === ADMIN && pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const signin = new URL("/auth/signin", `https://${ADMIN}`);
      signin.searchParams.set("callbackUrl", url.toString());
      return NextResponse.redirect(signin, { status: 307 });
    }

    if ((token as any).role !== "admin") {
      return NextResponse.rewrite(new URL("/403", `https://${ADMIN}`));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*", "/auth/signin", "/403"],
};
