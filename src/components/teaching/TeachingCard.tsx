'use client';

import styles from './TeachingCard.module.scss';

export interface TeachingCardProps {
  title: string;
  school: string;
  year: string;
  type: string;
  description: string;
  tags?: string[];
  onClick?: () => void; // ✅ Added to fix error
}

export default function TeachingCard({
  title,
  school,
  year,
  type,
  description,
  tags = [],
  onClick,
}: TeachingCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <h3>{title}</h3>
      <p className={styles.meta}>
        {school} · {year} · {type}
      </p>
      <p>{description}</p>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
