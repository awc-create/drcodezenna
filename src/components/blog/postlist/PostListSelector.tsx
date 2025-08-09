'use client';

import { useState } from 'react';
import styles from './PostListSelector.module.scss';
import type { BlogPost } from '@/types';

interface Props {
  posts: BlogPost[];
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
              key={post.id}
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
