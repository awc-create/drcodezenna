"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.scss";
import { NAV_LINKS } from "@/config/menu.config";

export default function Navbar() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  const isLinkActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPageLabel = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";

    const formatted = segments.map(segment => {
      const clean = segment.replace(/-/g, " ");
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    });

    return formatted.join(" / ");
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
        <span className={styles.homeLabel}>{getPageLabel()}</span>
      </div>

      <div className={styles.navBorder}></div>

      {!isAdmin && (
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
      )}

      <div className={styles.bottomLine}></div>
    </nav>
  );
}
