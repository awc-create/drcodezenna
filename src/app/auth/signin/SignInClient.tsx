"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./SignIn.module.scss";

const ADMIN_DEFAULT = "https://admin.drcodezenna.com";

function normalizeCallback(input: string | undefined): string {
  const base =
    (typeof window !== "undefined" && window.location.origin) || ADMIN_DEFAULT;
  try {
    if (!input) return "/admin";
    const u = new URL(input, base);
    const admin = new URL(base);
    u.protocol = "https:";
    u.host = admin.host;
    return u.toString();
  } catch {
    return "/admin";
  }
}

export default function SignInClient({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const safeCallbackUrl = useMemo(
    () => normalizeCallback(callbackUrl),
    [callbackUrl]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: safeCallbackUrl,
    });

    setSubmitting(false);

    if (res?.error) setErr("Invalid email or password");
    else if (res?.ok) window.location.href = safeCallbackUrl;
    else setErr("Sign in failed. Please try again.");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Admin sign in</h1>
        <form onSubmit={onSubmit} className={styles.form}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {err && <p className={styles.error}>{err}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
