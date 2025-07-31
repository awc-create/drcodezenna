"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.scss";
import { NAV_LINKS } from "@/config/menu.config";

export default function Navbar({ isEcommerce = false }: { isEcommerce?: boolean }) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.topBorders}>
        <div className={styles.thickLine}></div>
        <div className={styles.thinLine}></div>
      </div>

      <div className={styles.titleRow}>
        <span className={styles.date}>{getFormattedDate()}</span>
        <h1 className={styles.siteTitle}>DR. CODE</h1>
        <span className={styles.homeLabel}>Home</span>
      </div>

      <div className={styles.navBorder}></div>

      <div className={styles.navLinks}>
        {NAV_LINKS.map(({ slug, label }) => {
          const href = `/${slug}`;
          return (
            <Link
              key={slug}
              href={href}
              className={isLinkActive(href) ? styles.active : ""}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className={styles.bottomLine}></div>
    </nav>
  );
}
