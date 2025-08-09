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

const BookFlip = forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const flipRef = useRef<FlipBookRef | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

    // Public API for parent
    useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        const api = flipRef.current?.pageFlip?.();
        if (api?.flip) api.flip(index);
      },
    }));

    // Auto flip forward, loop at end
    useEffect(() => {
      if (stopAutoflip || pages.length === 0) return;

      const interval = setInterval(() => {
        if (isHovered) return;
        const api = flipRef.current?.pageFlip?.();
        if (!api) return;

        const i = api.getCurrentPageIndex?.();
        const n = api.getPageCount?.();
        if (typeof i === 'number' && typeof n === 'number') {
          if (i >= n - 1) {
            api.flip?.(0);
          } else {
            api.flipNext?.();
          }
        }
      }, 6000);

      return () => clearInterval(interval);
    }, [isHovered, stopAutoflip, pages]);

    const handleReadMore = (article: BlogPost) => {
      if (onReadMore) {
        onReadMore(article);
      } else {
        setSelectedArticle(article);
      }
    };

    // Enable corner drag & side-tap flipping
    const flipProps: FlipProps = {
      width: isMobile ? 360 : 500,
      height: 500,
      minWidth: 320,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1536,
      usePortrait: isMobile,      // single page on phones
      showCover: false,
      size: 'fixed',
      drawShadow: false,
      flippingTime: 900,
      showPageCorners: true,      // ✅ draggable corners
      disableFlipByClick: false,  // ✅ taps on left/right flip back/forward
      clickEventForward: false,   // let flipbook handle taps
      useMouseEvents: true,
      mobileScrollSupport: true,
      swipeDistance: 12,          // easier to start drag on mobile

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
          className={styles.bookContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
                    e.preventDefault();
                    e.stopPropagation(); // prevent accidental page flip
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
