'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
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

const BookFlip = forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const flipRef = useRef<FlipBookRef | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

    // public API
    useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        const api = flipRef.current?.pageFlip?.();
        if (api?.flip) api.flip(index);
      },
    }));

    const api = () => flipRef.current?.pageFlip?.();
    const flipNext = () => api()?.flipNext?.();
    const flipPrev = () => api()?.flipPrev?.();

    // stop page wobble during drag: block scroll while touching inside the book area
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
      };
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      return () => el.removeEventListener('touchmove', onTouchMove);
    }, []);

    // simple auto-flip loop (respects stopAutoflip)
    useEffect(() => {
      if (stopAutoflip || pages.length === 0) return;
      const t = setInterval(() => {
        const p = api();
        if (!p) return;
        const i = p.getCurrentPageIndex?.();
        const n = p.getPageCount?.();
        if (typeof i === 'number' && typeof n === 'number') {
          if (i >= n - 1) {
            p.flip?.(0);
          } else {
            p.flipNext?.();
          }
        }
      }, 6000);
      return () => clearInterval(t);
    }, [stopAutoflip, pages]);

    const handleReadMore = (article: BlogPost) => {
      if (onReadMore) {
        onReadMore(article);
      } else {
        setSelectedArticle(article);
      }
    };

    // corner-tap (we handle taps; library handles drags)
    const handleCornerTap = (e: MouseEvent<HTMLDivElement>) => {
      if (!isMobile) return;
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.readMore}`)) return; // allow button clicks

      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // define "corner" as 22% of width/height (tweak if needed)
      const cx = rect.width * 0.22;
      const cy = rect.height * 0.22;

      const inLeft = x <= cx;
      const inRight = x >= rect.width - cx;
      const inTop = y <= cy;
      const inBottom = y >= rect.height - cy;

      if ((inLeft && (inTop || inBottom)) || (inLeft && !inRight)) {
        flipPrev();
      } else if ((inRight && (inTop || inBottom)) || (inRight && !inLeft)) {
        flipNext();
      }
    };

    // flipbook props: drag corners enabled; disable built-in click so our taps & button work
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
      flippingTime: 900,
      showPageCorners: true,      // ✅ corner drag
      disableFlipByClick: true,   // ❗ we handle corner taps ourselves
      clickEventForward: true,    // ✅ inner buttons/links remain clickable
      useMouseEvents: true,
      mobileScrollSupport: false, // ✅ prevents page scroll during drag
      swipeDistance: 12,

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
          onClick={handleCornerTap} // our corner-tap handler
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
                  onClick={() => handleReadMore(page)}
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
