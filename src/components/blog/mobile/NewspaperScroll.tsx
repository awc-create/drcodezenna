'use client';

import styles from './NewspaperScroll.module.scss';
import type { BlogPost } from '@/types';

interface Props {
  posts: BlogPost[];
  onReadMore: (post: BlogPost) => void;
}

export default function NewspaperScroll({ posts, onReadMore }: Props) {
  return (
    <div className={styles.mobileNewspaper}>
      <h2 className={styles.stickyHeader}>Today’s Edition</h2>
      {posts.map((post) => (
        <article className={styles.articlePreview} key={post.id}>
          <h3>{post.title}</h3>
          <div className={styles.articleMeta}>By {post.author}</div>
          <p className={styles.dropCap}>{post.summary}</p>
          <button onClick={() => onReadMore(post)}>Read More</button>
        </article>
      ))}
    </div>
  );
}
