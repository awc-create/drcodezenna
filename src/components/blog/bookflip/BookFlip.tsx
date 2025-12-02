'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from './BookFlip.module.scss';
import type { BlogPost } from '@/types';

// Client-only components
const ArticleLightbox = dynamic(
  () => import('@/components/blog/article/ArticleLightbox'),
  { ssr: false }
);

// Flipbook (client only)
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
  isMobile?: boolean; // kept for API, behaviour is width-based
}

interface FlipBookApi {
  flip: (pageIndex: number) => void;
  flipNext: () => void;
  flipPrev: () => void;
  getCurrentPageIndex: () => number;
  getPageCount: () => number;
}

interface FlipBookRef {
  pageFlip: () => FlipBookApi;
}

const AUTO_INTERVAL_MS = 6000;
const MANUAL_PAUSE_MS = 5000;

const BookFlip = React.forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore }, ref) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const flipRef = React.useRef<FlipBookRef | null>(null);

    const [bookReady, setBookReady] = React.useState(false);
    const [peelActive, setPeelActive] = React.useState(true);
    const [selectedArticle, setSelectedArticle] =
      React.useState<BlogPost | null>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const [bookWidth, setBookWidth] = React.useState(500); // width of ONE page
    const [isNarrow, setIsNarrow] = React.useState(false); // true = phone/tablet portrait

    const timerRef = React.useRef<number | null>(null);

    // Responsive width & breakpoint (desktop 2 pages, mobile 1 page)
    React.useEffect(() => {
      const el = rootRef.current;
      if (!el) return;

      const ro = new ResizeObserver((entries) => {
        const cr = entries[0]?.contentRect;
        if (!cr) return;

        const narrow = cr.width < 768; // treat < 768px as “mobile”
        setIsNarrow(narrow);

        // width here is *per page*; react-pageflip will show 2 pages on wide screens
        const padding = narrow ? 8 : 32;
        const maxPageWidth = narrow ? cr.width - padding : 520; // cap desktop page to 520

        const target = Math.max(320, Math.min(maxPageWidth, cr.width - padding));
        setBookWidth((prev) =>
          Math.abs(target - prev) > 0.5 ? target : prev
        );
      });

      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const clearAuto = React.useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const scheduleAuto = React.useCallback(
      (delay: number) => {
        if (stopAutoflip || pages.length <= 1 || !bookReady) return;
        clearAuto();
        timerRef.current = window.setTimeout(() => {
          const api = flipRef.current?.pageFlip?.();
          if (!api) return;
          const i = api.getCurrentPageIndex();
          const n = api.getPageCount();
          if (i >= n - 1) api.flip(0);
          else api.flipNext();
        }, delay);
      },
      [clearAuto, stopAutoflip, pages.length, bookReady]
    );

    // Start / restart auto-flip when ready
    React.useEffect(() => {
      clearAuto();
      if (!stopAutoflip && pages.length > 1 && bookReady) {
        scheduleAuto(AUTO_INTERVAL_MS);
      }
      return clearAuto;
    }, [stopAutoflip, pages.length, bookReady, clearAuto, scheduleAuto]);

    // Mark ready when FlipBook exposes its API
    React.useEffect(() => {
      if (pages.length === 0) return;

      let raf = 0;
      const poll = () => {
        const api = flipRef.current?.pageFlip?.();
        if (api && typeof api.getCurrentPageIndex === 'function') {
          setBookReady(true);
          setCurrentIndex(api.getCurrentPageIndex());
        } else {
          raf = requestAnimationFrame(poll);
        }
      };

      raf = requestAnimationFrame(poll);
      return () => cancelAnimationFrame(raf);
    }, [pages.length]);

    // Imperative handle
    React.useImperativeHandle(
      ref,
      () => ({
        flipToPage: (index: number) => {
          const api = flipRef.current?.pageFlip?.();
          if (!api) return;
          const n = api.getPageCount();
          const clamped = Math.min(Math.max(index, 0), n - 1);
          setPeelActive(false);
          clearAuto();
          api.flip(clamped);
          scheduleAuto(MANUAL_PAUSE_MS);
        },
        flipPrev: () => {
          const api = flipRef.current?.pageFlip?.();
          if (!api) return;
          setPeelActive(false);
          clearAuto();
          api.flipPrev();
          scheduleAuto(MANUAL_PAUSE_MS);
        },
        flipNext: () => {
          const api = flipRef.current?.pageFlip?.();
          if (!api) return;
          setPeelActive(false);
          clearAuto();
          api.flipNext();
          scheduleAuto(MANUAL_PAUSE_MS);
        },
      }),
      [clearAuto, scheduleAuto]
    );

    // Update current index on flip
    const handleOnFlip = () => {
      if (peelActive) setPeelActive(false);
      const api = flipRef.current?.pageFlip?.();
      if (!api) return;
      setCurrentIndex(api.getCurrentPageIndex());
      clearAuto();
      scheduleAuto(MANUAL_PAUSE_MS);
    };

    // Simple preload for neighbors
    React.useEffect(() => {
      const indices = [currentIndex, currentIndex + 1, currentIndex - 1].filter(
        (i) => i >= 0 && i < pages.length
      );
      indices.forEach((i) => {
        const src = pages[i]?.image;
        if (src) {
          const img = new window.Image();
          img.src = src;
        }
      });
    }, [currentIndex, pages]);

    React.useEffect(
      () => () => {
        clearAuto();
      },
      [clearAuto]
    );

    const handleReadMore = (article: BlogPost) => {
      if (onReadMore) onReadMore(article);
      else setSelectedArticle(article);
    };

    // Kill flip events when pressing interactive controls inside the page
    const stopFlipEvents = (
      e: React.MouseEvent | React.TouchEvent | React.PointerEvent
    ) => {
      e.stopPropagation();
      // @ts-expect-error - nativeEvent type union, we only care about having the method
      if (e.nativeEvent?.stopImmediatePropagation) {
        // Some libs attach native listeners; this stops them too
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e.nativeEvent as any).stopImmediatePropagation();
      }
    };

    const renderPage = (page: BlogPost, i: number) => {
      const eager = i === currentIndex || i === currentIndex + 1;
      return (
        <div key={page.id ?? i} className={styles.page}>
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
            onMouseDown={stopFlipEvents}
            onTouchStart={stopFlipEvents}
            onClick={(e) => {
              stopFlipEvents(e);
              handleReadMore(page);
            }}
          >
            Read More <span className={styles.arrow}>→</span>
          </button>
        </div>
      );
    };

    const shouldShowLightbox = !!(selectedArticle && !onReadMore);

    // Height: slightly taller on desktop, tied to width on mobile
    const pageHeight = isNarrow
      ? Math.round(bookWidth * 1.1) // dynamic for phones
      : 500;

    // --- FIX: strongly-type style as CSSProperties so pointerEvents isn't just `string`
    const flipStyle: React.CSSProperties = {
      margin: '0 auto',
      opacity: bookReady ? 1 : 0,
      pointerEvents: bookReady ? 'auto' : 'none',
      transition: 'opacity 0.18s ease',
    };

    const flipProps = {
      width: bookWidth,
      height: pageHeight,
      minWidth: 320,
      maxWidth: 1000,
      minHeight: 360,
      maxHeight: 1536,
      usePortrait: isNarrow, // narrow = 1 page, wide = 2-page spread
      showCover: false,
      size: 'fixed' as const,
      autoSize: false,
      flippingTime: 900,
      drawShadow: true,
      maxShadowOpacity: 0.4,
      showPageCorners: true,
      disableFlipByClick: false,
      clickEventForward: true,
      useMouseEvents: true,
      mobileScrollSupport: true,
      swipeDistance: 40, // bigger threshold so small jitter while clicking doesn't flip
      startPage: 0,
      startZIndex: 0,
      className: styles.book,
      style: flipStyle,
      onFlip: handleOnFlip,
    };

    return (
      <div ref={rootRef} className={styles.bookContainer}>
        <div
          className={styles.bookWrap}
          data-ready={bookReady ? '1' : '0'}
          data-layout={isNarrow ? 'single' : 'spread'}
        >
          {/* Skeleton overlay while we wait for the FlipBook API */}
          {!bookReady && (
            <div className={styles.bookSkeleton} aria-hidden="true" />
          )}

          {/* Always mount FlipBook so the ref / API can become ready */}
          {pages.length > 0 && (
            <FlipBook
              key={isNarrow ? 'single' : 'spread'}
              ref={flipRef as React.RefObject<FlipBookRef>}
              {...flipProps}
            >
              {pages.map(renderPage)}
            </FlipBook>
          )}

          <div className={styles.edgeHints} aria-hidden="true">
            <div className={styles.edgeLabel}>Drag to flip</div>
          </div>

          {/* Right corner peel: always visible until first interaction */}
          <div
            className={styles.cornerPeel}
            data-active={peelActive ? '1' : '0'}
            aria-hidden="true"
          />

          {/* Left corner hint on mobile single-page layout when there is a previous page */}
          <div
            className={styles.cornerPeelLeft}
            data-active={isNarrow && currentIndex > 0 ? '1' : '0'}
            aria-hidden="true"
          />
        </div>

        {/* Desktop arrows below the book */}
        {!isNarrow && pages.length > 1 && (
          <div className={styles.desktopArrows}>
            <button
              type="button"
              className={styles.navArrow}
              disabled={currentIndex <= 0}
              onClick={() => {
                const api = flipRef.current?.pageFlip?.();
                if (!api) return;
                setPeelActive(false);
                clearAuto();
                api.flipPrev();
                scheduleAuto(MANUAL_PAUSE_MS);
              }}
            >
              ←
            </button>

            <span className={styles.desktopHint}>Drag to change page</span>

            <button
              type="button"
              className={styles.navArrow}
              disabled={currentIndex >= pages.length - 1}
              onClick={() => {
                const api = flipRef.current?.pageFlip?.();
                if (!api) return;
                setPeelActive(false);
                clearAuto();
                api.flipNext();
                scheduleAuto(MANUAL_PAUSE_MS);
              }}
            >
              →
            </button>
          </div>
        )}

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
