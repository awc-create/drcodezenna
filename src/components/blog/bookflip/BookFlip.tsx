'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { ComponentProps } from 'react';
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
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
}

const BookFlip = forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages = [], stopAutoflip, onReadMore, isMobile = false }, ref) => {
    const flipRef = useRef<FlipBookRef | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

    // Public API for parent via ref
    useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        const flipInstance = flipRef.current?.pageFlip?.();
        flipInstance?.flip?.(index);
      },
    }));

    // Auto flip unless stopped or hovered
    useEffect(() => {
      if (stopAutoflip || pages.length === 0) return;

      const interval = setInterval(() => {
        if (!isHovered && flipRef.current?.pageFlip) {
          const flipInstance = flipRef.current.pageFlip();
          if (
            flipInstance &&
            typeof flipInstance.getCurrentPageIndex === 'function' &&
            typeof flipInstance.getPageCount === 'function' &&
            typeof flipInstance.flipNext === 'function' &&
            typeof flipInstance.flip === 'function'
          ) {
            const current = flipInstance.getCurrentPageIndex();
            const total = flipInstance.getPageCount();

            // ✅ ESLint-safe if/else
            if (current >= total - 1) {
              flipInstance.flip(0);
            } else {
              flipInstance.flipNext();
            }
          }
        }
      }, 6000);

      return () => clearInterval(interval);
    }, [isHovered, stopAutoflip, pages]);

    // Local read more handler
    const handleReadMore = (article: BlogPost) => {
      if (onReadMore) {
        onReadMore(article);
      } else {
        setSelectedArticle(article);
      }
    };

    // Flipbook props
    const flipProps: ComponentProps<typeof HTMLFlipBook> = {
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
      flippingTime: 1000,
      showPageCorners: false,
      disableFlipByClick: isMobile,   // ✅ prevent accidental flips on mobile
      clickEventForward: !isMobile,   // ✅ don’t forward taps on mobile
      useMouseEvents: true,
      mobileScrollSupport: true,
      className: styles.book,
      style: { margin: '0 auto' },
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
                  />
                </div>
                <h2 className={styles.title}>{page.title}</h2>
                <hr className={styles.divider} />
                <p className={styles.author}>By {page.author}</p>
                <p className={styles.summary}>{page.summary}</p>

                {/* ✅ Mobile tap-safe button */}
                <button
                  type="button"
                  className={styles.readMore}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleReadMore(page);
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  Read More <span className={styles.arrow}>→</span>
                </button>
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {shouldShowLightbox && (
          <ArticleLightbox
            title={selectedArticle!.title}
            author={selectedArticle!.author}
            image={selectedArticle!.image}
            content={selectedArticle!.content}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </>
    );
  }
);

BookFlip.displayName = 'BookFlip';
export default BookFlip;
