'use client';

import styles from './FlipHint.module.scss';

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function FlipHint({ onPrev, onNext }: Props) {
  return (
    <div className={styles.hint} role="group" aria-label="Flipbook controls">
      <button
        type="button"
        aria-label="Previous page"
        className={styles.arrow}
        onClick={onPrev}
      >
        ‹
      </button>

      <span className={styles.text}>Drag to change page</span>

      <button
        type="button"
        aria-label="Next page"
        className={styles.arrow}
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
}
