"use client";

import { useEffect, useState } from "react";

export default function UnsubscribeClient({
  token,
  initialEmail,
}: {
  token: string;
  initialEmail: string;
}) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");

  // If a token is present in the URL, auto-process via GET /api/unsubscribe?t=...
  useEffect(() => {
    if (!token) return;

    (async () => {
      setStatus("working");
      try {
        const res = await fetch(`/api/unsubscribe?t=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({} as any));
        if (res.ok) {
          setStatus("done");
          setMsg(data?.message || "You have been unsubscribed.");
        } else {
          setStatus("error");
          setMsg(data?.error || "Invalid unsubscribe link.");
        }
      } catch {
        setStatus("error");
        setMsg("Failed to process unsubscribe.");
      }
    })();
  }, [token]);

  // Manual form: POST /api/unsubscribe { email }
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("working");
    setMsg("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (res.ok) {
        setStatus("done");
        setMsg(data?.message || "You have been unsubscribed.");
      } else {
        setStatus("error");
        setMsg(data?.error || "Failed to unsubscribe.");
      }
    } catch {
      setStatus("error");
      setMsg("Failed to unsubscribe.");
    }
  };

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "3rem auto",
        padding: "0 1rem",
        fontFamily: "Georgia, serif",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Unsubscribe</h1>

      {token ? (
        <p style={{ color: status === "error" ? "#b00" : "#333" }}>
          {status === "working" ? "Processing your request…" : msg}
        </p>
      ) : (
        <>
          <p style={{ color: "#555", marginBottom: 18 }}>
            Enter your email to stop receiving updates.
          </p>
          <form onSubmit={submitEmail} style={{ display: "grid", gap: 12 }}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.7rem 1rem",
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            />
            <button
              type="submit"
              disabled={status === "working"}
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: 6,
                background: "#111",
                color: "#fff",
                border: 0,
                cursor: "pointer",
              }}
            >
              {status === "working" ? "Unsubscribing…" : "Unsubscribe"}
            </button>
          </form>
          {msg ? (
            <p
              style={{
                marginTop: 16,
                color: status === "error" ? "#b00" : "#0a0",
              }}
            >
              {msg}
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
