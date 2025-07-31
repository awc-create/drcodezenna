"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { PAGE_NUMBERS } from "@/utils/pageNumbers";
import styles from "./Footer.module.scss";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const pageKeys = Object.keys(PAGE_NUMBERS);
  const currentIndex = pageKeys.indexOf(pathname);
  const nextPage = pageKeys[(currentIndex + 1) % pageKeys.length];
  const currentPageNumber = PAGE_NUMBERS[pathname] ?? "00";

  return (
    <footer className={styles.footer}>
      <span className={styles.pageHint} onClick={() => router.push(nextPage)}>
        Turn the page
      </span>

      <div className={styles.footerLinks}>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/faq">FAQ</Link>
      </div>

      <span className={styles.pageNumber}>{currentPageNumber}</span>
    </footer>
  );
}
