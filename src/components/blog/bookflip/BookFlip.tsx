'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import styles from './BookFlip.module.scss';
import Image from 'next/image';
import type { BlogPost } from '@/types';

const ArticleLightbox = dynamic(() => import('@/components/blog/article/ArticleLightbox'), {
  ssr: false,
});
const FlipBookDyn = dynamic(() => import('react-pageflip'), { ssr: false });

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

const AUTO_INTERVAL_MS = 6000;
const MANUAL_PAUSE_MS = 5000;
const JUST_FLIPPED_WINDOW = 250;
const NEAR_WINDOW = 1;

const BookFlip = React.forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const flipRef = React.useRef<FlipBookRef | null>(null);

    const [inView, setInView] = React.useState(false);
    const [bookReady, setBookReady] = React.useState(false);
    const [peelActive, setPeelActive] = React.useState(true);
    const [selectedArticle, setSelectedArticle] = React.useState<BlogPost | null>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);

    const touchStartX = React.useRef<number | null>(null);
    const touchStartT = React.useRef<number | null>(null);

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

    React.useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        flipRef.current?.pageFlip?.().flip?.(index);
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
      setIsDragging(true);
    };
    const handlePointerUp = () => {
      setIsDragging(false);
      if (!justFlippedRef.current) scheduleAuto(AUTO_INTERVAL_MS);
    };

    React.useEffect(() => {
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    const onTouchStart = (e: React.TouchEvent) => {
      if (!isMobile) return;
      const t = e.changedTouches[0];
      touchStartX.current = t.clientX;
      touchStartT.current = performance.now();
      setIsDragging(true);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
      if (!isMobile) return;
      const t = e.changedTouches[0];
      const sx = touchStartX.current;
      const st = touchStartT.current;
      touchStartX.current = null;
      touchStartT.current = null;

      setIsDragging(false);

      if (sx == null || st == null) return;

      const dx = t.clientX - sx;
      const dt = Math.max(1, performance.now() - st);
      const v = dx / dt;

      const QUICK = Math.abs(v) > 0.6;
      const SHORT = Math.abs(dx) > 30;

      if (QUICK || SHORT) {
        clearAuto();
        if (dx < 0) flipRef.current?.pageFlip?.().flipNext?.();
        else flipRef.current?.pageFlip?.().flipPrev?.();
        scheduleAuto(MANUAL_PAUSE_MS);
      }
    };

    const flipProps = {
      size: isMobile ? 'stretch' : 'fixed',
      width: isMobile ? 380 : 500,
      height: isMobile ? 520 : 500,
      minWidth: 300,
      maxWidth: 1000,
      minHeight: 420,
      maxHeight: 1536,
      usePortrait: isMobile,
      showCover: false,
      autoSize: true,
      drawShadow: false,
      maxShadowOpacity: 0,
      swipeDistance: isMobile ? 1 : 6,
      showPageCorners: !!isMobile,
      clickEventForward: true,
      useMouseEvents: true,
      disableFlipByClick: true,
      flippingTime: 800,
      mobileScrollSupport: true,
      onFlip: handleOnFlip,
      className: styles.book,
      style: { margin: '0 auto' },
      startPage: 0,
      startZIndex: 0,
    } as const;

    const NEAR_WHILE_DRAG = isMobile ? 3 : 2;
    const windowRadius = isDragging ? NEAR_WHILE_DRAG : NEAR_WINDOW;
    const isNear = (i: number) => Math.abs(i - currentIndex) <= windowRadius;

    const renderPage = (page: BlogPost, i: number) => {
      const eager = i < 2 || (isDragging && Math.abs(i - currentIndex) <= (windowRadius + 1));

      if (!isNear(i)) {
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
          {page.author && <p className={styles.author}>By {page.author}</p>}
          {page.summary && <p className={styles.summary}>{page.summary}</p>}
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
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={styles.bookWrap}
          data-ready={bookReady ? '1' : '0'}
          data-spread={isMobile ? '0' : '1'}
        >
          {!inView && <div className={styles.bookSkeleton} aria-hidden="true" />}

          {inView && (
            <FlipBookDyn {...(flipProps as any)} ref={flipRef as any}>
              {pages.map(renderPage)}
            </FlipBookDyn>
          )}

          {inView && (
            <>
              <div
                className={styles.hotzoneLeft}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAuto();
                  flipRef.current?.pageFlip?.().flipPrev?.();
                  scheduleAuto(MANUAL_PAUSE_MS);
                }}
                aria-hidden="true"
              />
              <div
                className={styles.hotzoneRight}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAuto();
                  flipRef.current?.pageFlip?.().flipNext?.();
                  scheduleAuto(MANUAL_PAUSE_MS);
                }}
                aria-hidden="true"
              />
            </>
          )}

          <div className={styles.edgeHints} aria-hidden="true">
            <div className={styles.edgeLabel}>Drag to flip</div>
          </div>

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
