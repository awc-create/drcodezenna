"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./FeaturedCard.module.scss";
import SubscribeBox from "@/components/common/SubscribeBox";

type BlogPost = {
  id: string;
  title: string;
  summary?: string;
  createdAt?: string; // optional; we’ll handle if it’s missing
};

export default function FeaturedCard() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/blog", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BlogPost[] = await res.json();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to fetch posts");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Pick the most recent post if available; otherwise null
  const latest = useMemo<BlogPost | null>(() => {
    if (!posts || posts.length === 0) return null;

    // Prefer createdAt if present; otherwise just use first item
    const hasDates = posts.some(p => p.createdAt);
    if (hasDates) {
      return [...posts].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })[0];
    }
    return posts[0];
  }, [posts]);

  // Fallback content (what you have now)
  const fallbackTitle = "Dr. Odera Ezenne aka Dr. Code Has a Website Now";
  const featuredTitle = latest?.title || fallbackTitle;

  return (
    <section className={styles.featuredBlock}>
      <h3 className={styles.label}>Featured</h3>

      <div className={styles.card}>
        <h4>
          {/* If you have per-post pages later, switch to `/blog/${latest?.id}` */}
          <Link href="/blog">
            {featuredTitle}
          </Link>
        </h4>

        <Link href="/blog" className={styles.readMore}>
          <span className={styles.arrow}>→</span> Read More
        </Link>
      </div>

      <Link href="/blog" className={styles.turnPage}>
        <em>Turn the page</em> <span className={styles.downArrow}>↓</span>
      </Link>

      <SubscribeBox />
    </section>
  );
}
