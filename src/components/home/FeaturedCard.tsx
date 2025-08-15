"use client";

import styles from "./FeaturedCard.module.scss";
import Link from "next/link";
import SubscribeBox from '@/components/common/SubscribeBox';

export default function FeaturedCard() {
  return (
    <section className={styles.featuredBlock}>
      <h3 className={styles.label}>Featured</h3>

      <div className={styles.card}>
        <h4>
          <Link href="/blog">
            Dr. Odera Ezenne aka Dr. Code Has a Website Now
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
