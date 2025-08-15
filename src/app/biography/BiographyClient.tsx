'use client';

import HeroHeader from "@/components/hero/HeroHeader";
import styles from "./Biography.module.scss";
import FeaturedCard from "@/components/home/FeaturedCard";
import { useHeroData } from "@/hooks/useHeroData";

export default function BiographyClient() {
  const { subtitle, bio } = useHeroData('biography');

  const [intro, rest] = bio.split('||');

  return (
    <main className={styles.home}>
      <HeroHeader title="BIOGRAPHY" subtitle={subtitle} />

      <hr className={styles.divider} />

      <section className={styles.bioSection}>
        <p className={styles.bio}>{intro}</p>
        {rest && <p className={styles.bio}>{rest.trim()}</p>}
      </section>

      <FeaturedCard />
    </main>
  );
}
