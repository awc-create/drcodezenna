// src/components/hero/HeroHeader.tsx

"use client";

import { ReactNode } from "react";
import Image from "next/image";
import styles from "./HeroHeader.module.scss";

type HeroHeaderProps = {
  title: ReactNode;
  subtitle: ReactNode;
};

export default function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        <h2>{title}</h2>
        <p className={styles.subtext}>{subtitle}</p>
      </div>

      <div className={styles.right}>
        <Image
          src="/assets/odera-silhouette.jpg"
          alt="Dr. Odera silhouette"
          width={250}
          height={250}
          priority
          className={styles.avatar}
        />
      </div>
    </section>
  );
}
