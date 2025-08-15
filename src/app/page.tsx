'use client';

import { useState } from 'react';
import HeroHeader from '@/components/hero/HeroHeader';
import FeaturedCard from '@/components/home/FeaturedCard';
import { useHeroData } from '@/hooks/useHeroData';
import styles from './page.module.scss';

export default function HomePage() {
  const [expanded, setExpanded] = useState(false);
  const { subtitle, bio } = useHeroData('home');

  const [bioIntro, bioFull] = (bio || '').split('||'); // Optional: use || to split intro/full

  return (
    <main className={styles.home}>
      <HeroHeader
        title={
          <>
            DR. ODERA<br />EZENNA
          </>
        }
        subtitle={subtitle}
      />

      <hr className={styles.divider} />

      <section className={styles.bioSection}>
        <p className={styles.bio}>
          {bioIntro}
          {expanded && bioFull && ' ' + bioFull}
        </p>
        {bioFull && (
          <button
            className={styles.readMore}
            onClick={() => setExpanded((prev) => !prev)}
          >
            → {expanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </section>

      <FeaturedCard />
    </main>
  );
}
