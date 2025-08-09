'use client';

import { useEffect, useState } from 'react';
import HeroHeader from '@/components/hero/HeroHeader';
import FeaturedCard from '@/components/home/FeaturedCard';
import TeachingCard from '@/components/teaching/TeachingCard';
import Lightbox from '@/components/shared/Lightbox';
import styles from './Teaching.module.scss';
import { useHeroData } from '@/hooks/useHeroData';

type TeachingPost = {
  id: string;
  title: string;
  school: string;
  year: string;
  type: string;
  isCurrent: boolean;
  tags: string[];
  description: string;
  fullText: string;
};

export default function TeachingClient() {
  const [lessons, setLessons] = useState<TeachingPost[]>([]);
  const [activeLesson, setActiveLesson] = useState<TeachingPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { subtitle } = useHeroData('teaching');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('/api/teaching');
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => parseInt(b.year) - parseInt(a.year));
          setLessons(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch teaching posts:', err);
      }
    };

    fetchLessons();
  }, []);

  const handleCardClick = (lesson: TeachingPost) => setActiveLesson(lesson);
  const closeLightbox = () => setActiveLesson(null);

  const totalPages = Math.ceil(lessons.length / itemsPerPage);
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
