"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
    const formatted = segments.map((segment) => {
      const clean = segment.replace(/-/g, " ");
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    });
    return formatted.join(" / ");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.topBorders}>
        <div className={styles.thickLine} />
        <div className={styles.thinLine} />
      </div>

      <div className={styles.titleRow}>
        {/* Desktop/Tablet: date | logo | page label */}
        {/* Mobile: logo on its own row, then date left / page right */}
        <span className={styles.date}>{getFormattedDate()}</span>

        <Link href="/" className={styles.siteTitle} aria-label="Go to homepage">
          <Image
            src="/assets/drcode-logo.png"
            alt="Dr. Code Logo"
            width={160}
            height={40}
            priority
          />
        </Link>

        <span className={styles.homeLabel}>{getPageLabel()}</span>

        {/* Mobile-only row for date + page label */}
        <div className={styles.metaRow}>
          <span className={styles.date}>{getFormattedDate()}</span>
          <span className={styles.homeLabel}>{getPageLabel()}</span>
        </div>
      </div>

      <div className={styles.navBorder} />

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

      <div className={styles.bottomLine} />
    </nav>
  );
}
