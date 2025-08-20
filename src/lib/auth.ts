import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  jwt: { secret: process.env.NEXTAUTH_SECRET },

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email.toLowerCase() },
          select: { id: true, email: true, name: true, role: true, passwordHash: true },
        });

        if (!user || !user.passwordHash) return null;

        const ok = await compare(creds.password, user.passwordHash);
        if (!ok) return null;

        // Optional: block non-admins at login time:
        // if (user.role !== "admin") return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: { signIn: "/auth/signin" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
