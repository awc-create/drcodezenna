"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./SignIn.module.scss";

export default function SignInClient({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setSubmitting(false);

    if (res?.error) setErr("Invalid email or password");
    else if (res?.ok) window.location.href = callbackUrl;
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
