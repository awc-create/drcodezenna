"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { PAGE_NUMBERS } from "@/utils/pageNumbers";
import styles from "./Footer.module.scss";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const pageKeys = Object.keys(PAGE_NUMBERS);
  const basePath = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;
  const currentIndex = pageKeys.indexOf(basePath);
  const nextPage = pageKeys[(currentIndex + 1) % pageKeys.length];
  const currentPageNumber = PAGE_NUMBERS[basePath] ?? "00";

  const isAdmin = pathname.startsWith("/admin");

  return (
    <footer className={styles.footer}>
      {isAdmin ? (
        <span className={styles.returnLink}>
          <Link href="/">← Return to Site</Link>
        </span>
      ) : (
        <>
          <span
            className={styles.pageHint}
            onClick={() => router.push(nextPage)}
            role="button"
            tabIndex={0}
            aria-label="Next page"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push(nextPage);
            }}
          >
            <span className={styles.turnText}>Turn the page</span>
            <span className={styles.downArrow} aria-hidden>↓</span>
          </span>

          <nav className={styles.links}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </>
      )}

      <span className={styles.pageNumber}>{currentPageNumber}</span>
    </footer>
  );
}
