'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './BookFlip.module.scss';
import ArticleLightbox from '@/components/blog/article/ArticleLightbox';
import Image from 'next/image';
import type { BlogPost } from '@/types';

export interface BookFlipHandle {
  flipToPage: (index: number) => void;
}

interface BookFlipProps {
  pages: BlogPost[];
  stopAutoflip: boolean;
  onReadMore?: (article: BlogPost) => void;
  isMobile?: boolean;
}

interface FlipBookRef {
  pageFlip: () => {
    flip: (pageIndex: number) => void;
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
}

type FlipProps = Omit<ComponentProps<typeof HTMLFlipBook>, 'children' | 'ref'>;

const AUTO_INTERVAL_MS = 6000;   // normal cadence
const MANUAL_PAUSE_MS = 5000;    // pause after *manual* flip
const JUST_FLIPPED_WINDOW = 250; // ms to detect “we just flipped”

const BookFlip = forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const flipRef = useRef<FlipBookRef | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

    // auto scheduling
    const timerRef = useRef<number | null>(null);
    const isAutoRef = useRef(false);
    const justFlippedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        const api = flipRef.current?.pageFlip?.();
        if (api?.flip) api.flip(index);
      },
    }));

    const api = () => flipRef.current?.pageFlip?.();

    const clearAuto = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleAuto = (delay: number) => {
      if (stopAutoflip || pages.length === 0) return;
      clearAuto();
      timerRef.current = window.setTimeout(() => {
        const p = api();
        if (!p) return;
        isAutoRef.current = true; // mark that this next flip is automatic
        const i = p.getCurrentPageIndex?.();
        const n = p.getPageCount?.();
        if (typeof i === 'number' && typeof n === 'number') {
          if (i >= n - 1) p.flip?.(0);
          else p.flipNext?.();
        }
      }, delay);
    };

    // initial (or when deps change)
    useEffect(() => {
      clearAuto();
      if (!stopAutoflip && pages.length > 0) scheduleAuto(AUTO_INTERVAL_MS);
      return clearAuto;
    }, [stopAutoflip, pages.length]);

    // When *any* flip finishes, restart the timer:
    // - auto flip → full AUTO_INTERVAL_MS
    // - manual flip → MANUAL_PAUSE_MS
    const handleOnFlip = () => {
      justFlippedRef.current = true;
      setTimeout(() => { justFlippedRef.current = false; }, JUST_FLIPPED_WINDOW);

      const wasAuto = isAutoRef.current;
      isAutoRef.current = false;

      clearAuto();
      scheduleAuto(wasAuto ? AUTO_INTERVAL_MS : MANUAL_PAUSE_MS);
    };

    const handleReadMore = (article: BlogPost) => {
      if (onReadMore) onReadMore(article);
      else setSelectedArticle(article);
      // we do NOT touch timers here; we rely on onFlip only
    };

    // Pause only the AUTO if the user starts interacting,
    // and resume after: if a flip happens, onFlip handles pause; if not, resume normal cadence.
    const handlePointerDown = () => {
      clearAuto(); // stop any imminent auto flip while user is dragging/tapping
    };
    const handlePointerUp = () => {
      // if we didn't actually flip, resume normal cadence
      if (!justFlippedRef.current) {
        scheduleAuto(AUTO_INTERVAL_MS);
      }
    };

    const flipProps: FlipProps = {
      width: isMobile ? 360 : 500,
      height: 500,
      minWidth: 320,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1536,
      usePortrait: isMobile,     // single page on phones
      showCover: false,
      size: 'fixed',
      drawShadow: false,
      flippingTime: 850,         // snappy finish
      showPageCorners: true,     // real corner drag + corner taps
      disableFlipByClick: false, // built-in tap to flip (left/back, right/forward)
      clickEventForward: true,   // keep inner buttons clickable
      useMouseEvents: true,
      mobileScrollSupport: false, // flip owns the touch
      swipeDistance: 6,          // tiny pull still flips (prevents “fall back”)

      onFlip: handleOnFlip,

      className: styles.book,
      style: { margin: '0 auto' },
      startPage: 0,
      startZIndex: 0,
      autoSize: true,
      maxShadowOpacity: 0,
    };

    const shouldShowLightbox = Boolean(selectedArticle) && !onReadMore;

    return (
      <>
        <div
          ref={containerRef}
          className={styles.bookContainer}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <HTMLFlipBook {...flipProps} ref={flipRef}>
            {pages.map((page, index) => (
              <div key={index} className={styles.page}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={page.image || '/assets/fallback-blog.jpeg'}
                    alt={page.title}
                    width={400}
                    height={250}
                    className={styles.image}
                    priority={index < 2}
                  />
                </div>
                <h2 className={styles.title}>{page.title}</h2>
                <hr className={styles.divider} />
                <p className={styles.author}>By {page.author}</p>
                <p className={styles.summary}>{page.summary}</p>

                <button
                  type="button"
                  className={styles.readMore}
                  onClick={(e) => {
                    e.stopPropagation(); // avoid treating it as a flip tap
                    handleReadMore(page);
                  }}
                >
                  Read More <span className={styles.arrow}>→</span>
                </button>
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {shouldShowLightbox && selectedArticle && (
          <ArticleLightbox
            title={selectedArticle.title}
            author={selectedArticle.author}
            image={selectedArticle.image}
            content={selectedArticle.content}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </>
    );
  }
);

BookFlip.displayName = 'BookFlip';
export default BookFlip;
