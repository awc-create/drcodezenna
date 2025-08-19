import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const MAIN = "drcodezenna.com";
const ADMIN = "admin.drcodezenna.com";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || url.hostname;

  // Redirect /admin on the main domain -> homepage
  if (url.pathname.startsWith("/admin") && (host === MAIN || host === `www.${MAIN}`)) {
    return NextResponse.redirect(new URL(`https://${MAIN}/`), { status: 308 });
  }

  // Gate /admin on the admin subdomain
  if (host === ADMIN && url.pathname.startsWith("/admin")) {
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
  matcher: ["/admin", "/admin/:path*"],
};
