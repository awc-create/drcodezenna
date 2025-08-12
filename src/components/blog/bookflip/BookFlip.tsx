'use client';

/**
 * Fast BookFlip:
 * - dynamic() import for react-pageflip (no SSR, smaller initial JS)
 * - mount-on-visible using IntersectionObserver
 * - skeleton placeholder while loading
 * - windowed page content (current ± 1)
 * - eager images on first spread, lazy after
 * - static corner peel + "Drag to flip" label (gated until book ready)
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import styles from './BookFlip.module.scss';
import Image from 'next/image';
import type { BlogPost } from '@/types';

// Lightbox client-only (avoids hydration issues if it portals/uses window)
const ArticleLightbox = dynamic(() => import('@/components/blog/article/ArticleLightbox'), {
  ssr: false,
});

// Load react-pageflip only on the client, when needed
const FlipBook = dynamic(() => import('react-pageflip'), { ssr: false });

export interface BookFlipHandle {
  flipToPage: (index: number) => void;
  flipPrev?: () => void;
  flipNext?: () => void;
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

type FlipProps = Omit<React.ComponentProps<typeof FlipBook>, 'children' | 'ref'>;

const AUTO_INTERVAL_MS = 6000;
const MANUAL_PAUSE_MS = 5000;
const JUST_FLIPPED_WINDOW = 250;

// How many pages around the current one to render fully
const NEAR_WINDOW = 1;

const BookFlip = React.forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const flipRef = React.useRef<FlipBookRef | null>(null);

    // Mount flipbook only when visible
    const [inView, setInView] = React.useState(false);

    // Overlays wait until the flipbook API exists
    const [bookReady, setBookReady] = React.useState(false);

    // Static peel shown until first interaction/flip
    const [peelActive, setPeelActive] = React.useState(true);

    // ✅ Selected article state (was missing before)
    const [selectedArticle, setSelectedArticle] = React.useState<BlogPost | null>(null);

    // Track current page for windowed rendering
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Lazy-mount when scrolled into view
    React.useEffect(() => {
      const el = rootRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);

    // Mark ready once FlipBook exposes its API
    React.useEffect(() => {
      if (!inView) return;
      let raf = 0;
      const poll = () => {
        const api = flipRef.current?.pageFlip?.();
        if (api && typeof api.getCurrentPageIndex === 'function') {
          setBookReady(true);
          setCurrentIndex(api.getCurrentPageIndex?.() ?? 0);
        } else {
          raf = requestAnimationFrame(poll);
        }
      };
      raf = requestAnimationFrame(poll);
      return () => cancelAnimationFrame(raf);
    }, [inView]);

    // Imperative controls
    React.useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        const api = flipRef.current?.pageFlip?.();
        api?.flip?.(index);
      },
      flipPrev: () => {
        clearAuto();
        flipRef.current?.pageFlip?.().flipPrev?.();
      },
      flipNext: () => {
        clearAuto();
        flipRef.current?.pageFlip?.().flipNext?.();
      },
    }));

    // Auto-flip
    const timerRef = React.useRef<number | null>(null);
    const isAutoRef = React.useRef(false);
    const justFlippedRef = React.useRef(false);

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
        const api = flipRef.current?.pageFlip?.();
        if (!api) return;
        isAutoRef.current = true;
        const i = api.getCurrentPageIndex?.();
        const n = api.getPageCount?.();
        if (typeof i === 'number' && typeof n === 'number') {
          if (i >= n - 1) api.flip?.(0);
          else api.flipNext?.();
        }
      }, delay);
    };

    React.useEffect(() => {
      clearAuto();
      if (inView && !stopAutoflip && pages.length > 0) scheduleAuto(AUTO_INTERVAL_MS);
      return clearAuto;
    }, [inView, stopAutoflip, pages.length]);

    // On flip: update index, retire peel, and reschedule auto
    const handleOnFlip = () => {
      if (peelActive) setPeelActive(false);
      const api = flipRef.current?.pageFlip?.();
      if (api) setCurrentIndex(api.getCurrentPageIndex?.() ?? 0);

      justFlippedRef.current = true;
      setTimeout(() => { justFlippedRef.current = false; }, JUST_FLIPPED_WINDOW);

      const wasAuto = isAutoRef.current;
      isAutoRef.current = false;
      clearAuto();
      scheduleAuto(wasAuto ? AUTO_INTERVAL_MS : MANUAL_PAUSE_MS);
    };

    const handleReadMore = (article: BlogPost) => {
      onReadMore ? onReadMore(article) : setSelectedArticle(article);
    };

    const handlePointerDown = () => {
      if (peelActive) setPeelActive(false);
      clearAuto();
    };
    const handlePointerUp = () => {
      if (!justFlippedRef.current) scheduleAuto(AUTO_INTERVAL_MS);
    };

    React.useEffect(() => {
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    // Fixed sizes minimize re-measure work inside react-pageflip
    const flipProps: FlipProps = {
      width: isMobile ? 360 : 500,
      height: 500,
      minWidth: 320,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1536,
      usePortrait: isMobile,
      showCover: false,
      size: 'fixed',
      drawShadow: false,
      flippingTime: 850,
      showPageCorners: false,
      disableFlipByClick: false,
      clickEventForward: true,
      useMouseEvents: true,
      mobileScrollSupport: false,
      swipeDistance: 6,
      onFlip: handleOnFlip,
      className: styles.book,
      style: { margin: '0 auto' },
      startPage: 0,
      startZIndex: 0,
      autoSize: false, // <-- avoid extra measuring
      maxShadowOpacity: 0,
    };

    // Window the page content (current ± NEAR_WINDOW)
    const isNear = (i: number) => Math.abs(i - currentIndex) <= NEAR_WINDOW;

    const renderPage = (page: BlogPost, i: number) => {
      const eager = i < 2; // eager-load first spread’s images
      if (!isNear(i)) {
        // Lightweight placeholder for far pages
        return (
          <div key={i} className={styles.page}>
            <div className={styles.pagePlaceholder} />
            <h2 className={styles.title}>{page.title}</h2>
          </div>
        );
      }
      return (
        <div key={i} className={styles.page}>
          <div className={styles.imageWrapper}>
            <Image
              src={page.image || '/assets/fallback-blog.jpeg'}
              alt={page.title}
              width={400}
              height={250}
              className={styles.image}
              priority={eager}
              loading={eager ? 'eager' : 'lazy'}
              sizes="(max-width: 768px) 360px, 500px"
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
              e.stopPropagation();
              handleReadMore(page);
            }}
          >
            Read More <span className={styles.arrow}>→</span>
          </button>
        </div>
      );
    };

    const shouldShowLightbox = !!(selectedArticle && !onReadMore);

    return (
      <div
        ref={rootRef}
        className={styles.bookContainer}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div
          className={styles.bookWrap}
          data-ready={bookReady ? '1' : '0'}
          data-spread={isMobile ? '0' : '1'}
        >
          {/* Skeleton until it scrolls into view */}
          {!inView && <div className={styles.bookSkeleton} aria-hidden="true" />}

          {inView && (
            <FlipBook {...flipProps} ref={flipRef as any}>
              {pages.map(renderPage)}
            </FlipBook>
          )}

          {/* Label (only after book is ready) */}
          <div className={styles.edgeHints} aria-hidden="true">
            <div className={styles.edgeLabel}>Drag to flip</div>
          </div>

          {/* Static corner peel (hidden after first interaction/flip) */}
          <div
            className={styles.cornerPeel}
            data-active={peelActive ? '1' : '0'}
            aria-hidden="true"
          />
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
      </div>
    );
  }
);

BookFlip.displayName = 'BookFlip';
export default BookFlip;
