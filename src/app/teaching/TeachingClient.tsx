'use client';

import { useState } from 'react';
import HeroHeader from '@/components/hero/HeroHeader';
import FeaturedCard from '@/components/home/FeaturedCard';
import TeachingCard from '@/components/teaching/TeachingCard';
import Lightbox from '@/components/shared/Lightbox';
import styles from './Teaching.module.scss';

export default function TeachingClient() {
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  const lessons = [
    {
      title: 'Critical Reading & Composition',
      school: 'NYU',
      year: '2023',
      type: 'Seminar',
      tags: ['Rhetoric', 'Close Reading'],
      description:
        'Engage deeply with texts through argument analysis, clarity, and academic writing.',
      fullText:
        'This intensive seminar guides students through rhetorical analysis, thesis development, and writing workshops. Emphasis on revision and critical argumentation.',
    },
    {
      title: 'Postcolonial Literary Studies',
      school: 'Columbia University',
      year: '2022',
      type: 'Lecture',
      tags: ['Theory', 'History', 'Global South'],
      description:
        'Explores literature from formerly colonized nations, focusing on identity, resistance, and representation.',
      fullText:
        'Focuses on Fanon, Said, Spivak, and local archives. Students critically engage with power and narrative through texts from Africa, Asia, and the Caribbean.',
    },
    {
      title: 'Advanced Academic Writing',
      school: 'The New School',
      year: '2024',
      type: 'Workshop',
      tags: ['Thesis', 'Editing', 'Structure'],
      description:
        'Guides students through thesis construction, structuring evidence, and stylistic clarity in essays.',
      fullText:
        'A capstone writing workshop covering long-form argumentation, research integration, and advanced feedback loops.',
    },
  ];

  const handleCardClick = (index: number) => {
    setActiveLesson(index);
  };

  const closeLightbox = () => {
    setActiveLesson(null);
  };

  return (
    <main className={styles.home}>
      <HeroHeader
        title="TEACHING"
        subtitle="Guiding minds, shaping futures."
      />
      <hr className={styles.divider} />

      <section className={styles.cardSection}>
        {lessons.map((lesson, idx) => (
          <TeachingCard
            key={idx}
            title={lesson.title}
            school={lesson.school}
            year={lesson.year}
            type={lesson.type}
            tags={lesson.tags}
            description={lesson.description}
            onClick={() => handleCardClick(idx)}
          />
        ))}
      </section>

      <section className={styles.featured}>
        <FeaturedCard />
      </section>

      {activeLesson !== null && (
        <Lightbox onClose={closeLightbox}>
          <div className={styles.lightboxContent}>
            <h2>{lessons[activeLesson].title}</h2>
            <p className={styles.meta}>
              {lessons[activeLesson].school} · {lessons[activeLesson].year} · {lessons[activeLesson].type}
            </p>
            <p>{lessons[activeLesson].fullText}</p>
          </div>
        </Lightbox>
      )}
    </main>
  );
}
