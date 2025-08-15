 'use client';

import { useEffect, useState } from 'react';
import HeroHeader from '@/components/hero/HeroHeader';
import FeaturedCard from '@/components/home/FeaturedCard';
import TeachingCard from '@/components/teaching/TeachingCard';
import Lightbox from '@/components/shared/Lightbox';
import styles from './Teaching.module.scss';
import { useHeroData } from '@/hooks/useHeroData';
import type { TeachingPost } from '@/types';
import { getAllTeachingPosts } from '@/utils/api';

export default function TeachingClient() {
  const [lessons, setLessons] = useState<TeachingPost[]>([]);
  const [activeLesson, setActiveLesson] = useState<TeachingPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { subtitle } = useHeroData('teaching');

  // Load real teaching posts OR 4 fallbacks if none exist
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getAllTeachingPosts(); // returns real or fallback
      const sorted = [...data].sort((a, b) => Number(b.year) - Number(a.year));
      if (!cancelled) setLessons(sorted);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCardClick = (lesson: TeachingPost) => setActiveLesson(lesson);
  const closeLightbox = () => setActiveLesson(null);

  const totalPages = Math.ceil(lessons.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedLessons = lessons.slice(startIdx, startIdx + itemsPerPage);

  return (
    <main className={styles.home}>
      <HeroHeader title="TEACHING" subtitle={subtitle} />

      <hr className={styles.divider} />

      <section className={styles.cardSection}>
        {paginatedLessons.map((lesson) => (
          <TeachingCard
            key={lesson.id}
            title={lesson.title}
            school={lesson.school}
            year={lesson.year}
            type={lesson.type}
            tags={lesson.tags}
            description={lesson.description}
            onClick={() => handleCardClick(lesson)}
          />
        ))}
      </section>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <section className={styles.featured}>
        <FeaturedCard />
      </section>

      {activeLesson && (
        <Lightbox onClose={closeLightbox}>
          <div className={styles.lightboxContent}>
            <h2>{activeLesson.title}</h2>
            <p className={styles.meta}>
              {activeLesson.school} · {activeLesson.year} · {activeLesson.type}{' '}
              {activeLesson.isCurrent && <strong>(Current)</strong>}
            </p>
            <p>{activeLesson.fullText}</p>
          </div>
        </Lightbox>
      )}
    </main>
  );
}
