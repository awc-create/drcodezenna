'use client';

/**
 * Fast BookFlip v2:
 * - dynamic() import + lazy mount on visible
 * - responsive book width via ResizeObserver (no reflow churn)
 * - "snap-to-flip": any tiny drag forces next/prev
 * - swipeDistance=1 for built-in tiny swipe acceptance
 * - windowed rendering expands while flipping (reduces pop-in)
 * - eager-load nearby images
 * - GPU/perf CSS hints (translateZ, contain, backface-visibility)
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import styles from './BookFlip.module.scss';
import Image from 'next/image';
import type { BlogPost } from '@/types';

// Client-only components
const ArticleLightbox = dynamic(() => import('@/components/blog/article/ArticleLightbox'), {
  ssr: false,
});
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

// Base window sizes; we expand this while flipping to avoid pop-in
const NEAR_WINDOW_MOBILE = 1;
const NEAR_WINDOW_DESKTOP = 2;

const BookFlip = React.forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const flipRef = React.useRef<FlipBookRef | null>(null);

    // Viewport-aware mount
    const [inView, setInView] = React.useState(false);

    // Book API ready
    const [bookReady, setBookReady] = React.useState(false);

    // Static peel until first interaction/flip
    const [peelActive, setPeelActive] = React.useState(true);

    // Selected article for built-in lightbox
    const [selectedArticle, setSelectedArticle] = React.useState<BlogPost | null>(null);

    // Current logical page index
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Are we actively flipping? (to widen render window & avoid “pop-in”)
    const [isFlipping, setIsFlipping] = React.useState(false);

    // Responsive book width (follows container)
    const [bookWidth, setBookWidth] = React.useState<number>(isMobile ? 360 : 500);

    // Lazy mount when visible
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

    // Observe container width to set the book width responsively
    React.useEffect(() => {
      const el = rootRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const cr = entries[0]?.contentRect;
        if (!cr) return;
        // Cap the mobile width a bit so images remain crisp
        const target = isMobile ? Math.min(Math.max(320, cr.width - 16), 480) : 500;
        if (Math.abs(target - bookWidth) > 0.5) setBookWidth(target);
      });
      ro.observe(el);
      return () => ro.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

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

    // Auto-flip scheduler
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

    // Flip callbacks
    const handleOnFlip = () => {
      if (peelActive) setPeelActive(false);
      const api = flipRef.current?.pageFlip?.();
      if (api) setCurrentIndex(api.getCurrentPageIndex?.() ?? 0);

      justFlippedRef.current = true;
      setTimeout(() => {
        justFlippedRef.current = false;
      }, JUST_FLIPPED_WINDOW);

      const wasAuto = isAutoRef.current;
      isAutoRef.current = false;
      clearAuto();
      scheduleAuto(wasAuto ? AUTO_INTERVAL_MS : MANUAL_PAUSE_MS);
    };

    // “Snap to flip” fallback — any tiny drag commits next/prev
    const dragStartX = React.useRef<number | null>(null);
    const dragDelta = React.useRef(0);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (peelActive) setPeelActive(false);
      clearAuto();
      dragStartX.current = e.clientX;
      dragDelta.current = 0;
      setIsFlipping(true); // widen render window immediately
    };
    const handlePointerMove = (e: React.PointerEvent) => {
      if (dragStartX.current != null) {
        dragDelta.current = e.clientX - dragStartX.current;
      }
    };
    const handlePointerUp = () => {
      if (!justFlippedRef.current) {
        const delta = dragDelta.current;
        const threshold = 2; // tiny nudge is enough
        if (Math.abs(delta) >= threshold) {
          const api = flipRef.current?.pageFlip?.();
          if (api) {
            if (delta < 0) api.flipNext?.();
            else api.flipPrev?.();
          }
        }
      }
      dragStartX.current = null;
      dragDelta.current = 0;
      setIsFlipping(false);
      scheduleAuto(AUTO_INTERVAL_MS);
    };

    // If library exposes state changes, use them to widen window while folding
    const handleChangeState = (e: any) => {
      const s = e?.data ?? e; // some builds emit strings
      if (s === 'user_fold' || s === 'animating' || s === 'flipping') {
        setIsFlipping(true);
      }
      if (s === 'fold_ended' || s === 'idle' || s === 'finished') {
        setIsFlipping(false);
      }
    };

    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    // Preload nearby images (helps avoid pop-in)
    React.useEffect(() => {
      const idxs: number[] = [];
      const base = isMobile ? NEAR_WINDOW_MOBILE : NEAR_WINDOW_DESKTOP;
      const extra = isFlipping || justFlippedRef.current ? 2 : 0;
      const span = base + extra + 1;
      for (let d = 0; d <= span; d++) {
        if (currentIndex + d < pages.length) idxs.push(currentIndex + d);
        if (currentIndex - d >= 0) idxs.push(currentIndex - d);
      }
      const srcs = idxs
        .map((i) => pages[i]?.image)
        .filter((s): s is string => typeof s === 'string' && s.length > 0);
      srcs.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }, [currentIndex, isFlipping, isMobile, pages]);

    // Compute window size (wider while flipping)
    const nearWindow = React.useMemo(() => {
      const base = isMobile ? NEAR_WINDOW_MOBILE : NEAR_WINDOW_DESKTOP;
      return base + (isFlipping || justFlippedRef.current ? 2 : 0);
    }, [isMobile, isFlipping]);

    const isNear = (i: number) => Math.abs(i - currentIndex) <= nearWindow;

    // FlipBook props (tuned)
    const flipProps: FlipProps = {
      width: bookWidth,                 // responsive to container
      height: 500,
      minWidth: 320,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1536,
      usePortrait: isMobile,
      showCover: false,
      size: 'fixed',
      autoSize: false,                  // avoid internal re-measuring
      swipeDistance: 1,                 // accept tiny drags
      drawShadow: false,
      flippingTime: 780,                // a touch snappier
      showPageCorners: false,
      disableFlipByClick: false,
      clickEventForward: true,
      useMouseEvents: true,
      mobileScrollSupport: false,
      onFlip: handleOnFlip,
      onChangeState: handleChangeState as any, // may be ignored by some builds
      className: styles.book,
      style: { margin: '0 auto' },
      startPage: 0,
      startZIndex: 0,
      maxShadowOpacity: 0,
    };

    const handleReadMore = (article: BlogPost) => {
      onReadMore ? onReadMore(article) : setSelectedArticle(article);
    };

    // Render a single page; eager-load near pages to reduce pop-in
    const renderPage = (page: BlogPost, i: number) => {
      const eager = isNear(i); // anything in the window gets priority
      if (!isNear(i)) {
        // Lightweight placeholder for far pages
        return (
          <div key={i} className={styles.page} data-lite="1">
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
        onPointerMove={handlePointerMove}
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
