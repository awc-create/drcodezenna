// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toLowerCase().trim();
        const password = credentials?.password || "";
        if (!email || !password) return null;
        if (email !== ADMIN_EMAIL) return null;

        const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!ok) return null;

        // Include role; cast to any to satisfy NextAuth's default User type
        return { id: "admin", name: "Admin", email, role: "admin" } as any;
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 60 * 60 }, // 1h

  callbacks: {
    async jwt({ token, user }) {
      if (user?.email && (user as any).role) (token as any).role = (user as any).role;
      else if (token?.email)
        (token as any).role = token.email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user";
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = (token as any).role;
      return session;
    },
  },

  pages: { signIn: "/auth/signin" },

  // Host-only cookie => admin subdomain has its own session
  cookies: {
    sessionToken: {
      name: "__Secure-admin.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        path: "/", // no domain => host-only on admin.drcodezenna.com
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
