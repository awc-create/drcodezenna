'use client';

import { useState } from 'react';
import styles from './PostListSelector.module.scss';

interface Article {
  title: string;
  summary: string;
}

interface Props {
  posts: Article[];
  onSelect: (index: number) => void;
  currentIndex: number;
}

export default function PostListSelector({
  posts,
  onSelect,
  currentIndex,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.selectorContainer}>
      <button onClick={() => setOpen(!open)} className={styles.toggleButton}>
        {open ? 'Hide Articles ▲' : 'Browse Articles ▼'}
      </button>

      {open && (
        <ul className={styles.articleList}>
          {posts.map((post, idx) => (
            <li
              key={idx}
              className={`${styles.articleItem} ${
                currentIndex === idx ? styles.active : ''
              }`}
              onClick={() => onSelect(idx)}
            >
              <strong>{post.title}</strong>
              <p>{post.summary.slice(0, 80)}...</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
