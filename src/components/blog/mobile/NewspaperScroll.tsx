'use client';

import styles from './NewspaperScroll.module.scss';

interface Post {
  title: string;
  author: string;
  summary: string;
  image: string;
  content: string;
}

interface Props {
  posts: Post[];
  onReadMore: (post: Post) => void;
}

export default function NewspaperScroll({ posts, onReadMore }: Props) {
  return (
    <div className={styles.mobileNewspaper}>
      <h2 className={styles.stickyHeader}>Today’s Edition</h2>
      {posts.map((post) => (
        <article className={styles.articlePreview} key={post.title}>
          <h3>{post.title}</h3>
          <div className={styles.articleMeta}>By Dr. Odera Ezenna</div>
          <p className={styles.dropCap}>{post.summary}</p>
          <button onClick={() => onReadMore(post)}>Read More</button>
        </article>
      ))}
    </div>
  );
}
