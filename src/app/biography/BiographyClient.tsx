"use client";

import HeroHeader from "@/components/hero/HeroHeader";
import styles from "./Biography.module.scss";
import FeaturedCard from "@/components/home/FeaturedCard";


export default function BiographyClient() {
  return (
    <main className={styles.home}>
      <HeroHeader
        title="BIOGRAPHY"
        subtitle={
          <>
            Knowing others is intelligence; <br />
            knowing yourself is true wisdom.
          </>
        }
      />

      <hr className={styles.divider} />

      <section className={styles.bioSection}>
        <p className={styles.bio}>
          I’m a writer. A master of ideas. And a lifelong student of language.
        </p>
        <p className={styles.bio}>
          It started with long school essays and turned into a life of teaching, editing, and chasing clarity. 
          I’ve spent years turning messy thoughts into clean sentences — and yes, correcting the odd public typo.
        </p>
      </section>
      <FeaturedCard />
    </main>
  );
}
