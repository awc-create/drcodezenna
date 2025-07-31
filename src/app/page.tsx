"use client";

import { useState } from "react";
import HeroHeader from "@/components/hero/HeroHeader";
import styles from "./page.module.scss";
import FeaturedCard from "@/components/home/FeaturedCard";

export default function HomePage() {
  const [expanded, setExpanded] = useState(false);

  return (
    <main className={styles.home}>
      <HeroHeader
        title={
          <>
            DR. ODERA<br />EZENNA
          </>
        }
        subtitle={
          <>
            Crafted in language,<br />carried by purpose.
          </>
        }
      />

      <hr className={styles.divider} />

      <section className={styles.bioSection}>
        <p className={styles.bio}>
          I&apos;m a writer, a master of ideas. Armed with degrees and an unrepentant love for semicolons,
          I explore the intricate dance of education and writing.
          {expanded && (
            <>
              {" "}
              My passion lies in blending narrative with knowledge, shaping thoughts through words.
              With a background in academia and a voice rooted in culture, I continue to write with purpose,
              provoke thought, and pass on the gift of expression.
            </>
          )}
        </p>
        <button className={styles.readMore} onClick={() => setExpanded(prev => !prev)}>
          → {expanded ? "Read Less" : "Read More"}
        </button>
      </section>

      <FeaturedCard />
    </main>
  );
}
