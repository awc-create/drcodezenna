'use client';

import styles from './ArticleLightbox.module.scss';
import Image from 'next/image';

interface LightboxArticleProps {
  title: string;
  author: string;
  image: string;
  content: string;
  onClose: () => void;
}

export default function LightboxArticle({
  title,
  author,
  image,
  content,
  onClose,
}: LightboxArticleProps) {
  const paragraphs =
    typeof content === 'string' && content.trim().length > 0
      ? content.split('\n\n')
      : [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <hr className={styles.divider} />
        <h1 className={styles.title}>{title}</h1>
        <hr className={styles.divider} />
        <p className={styles.byline}>Written by {author}</p>

        <div className={styles.contentArea}>
          <div className={styles.imageWrapper}>
            <Image
              src={image || '/assets/fallback-blog.jpeg'}
              alt={title}
              width={400}
              height={250}
              className={styles.image}
              onError={(e) => console.warn('Image failed to load', e)}
            />
          </div>
          <div className={styles.text}>
            {paragraphs.length === 0 ? (
              <p>No content available.</p>
            ) : (
              paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
            )}
          </div>
        </div>

        <button className={styles.close} onClick={onClose}>
          ✕ Close
        </button>
      </div>
    </div>
  );
}
