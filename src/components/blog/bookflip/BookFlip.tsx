'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { ComponentProps } from 'react';
import styles from './BookFlip.module.scss';
import ArticleLightbox from '../article/ArticleLightbox';
import Image from 'next/image';

export interface BookFlipHandle {
  flipToPage: (index: number) => void;
}

export interface Article {
  title: string;
  author: string;
  summary: string;
  image: string;
  content: string;
}

interface BookFlipProps {
  pages: Article[];
  stopAutoflip: boolean;
  onReadMore?: (article: Article) => void;
}

// ✅ Manual typing for the flipRef
interface FlipBookRef {
  pageFlip: () => {
    flip: (pageIndex: number) => void;
    flipNext: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
}

const BookFlip = forwardRef<BookFlipHandle, BookFlipProps>(
  ({ pages, stopAutoflip, onReadMore }, ref) => {
    const flipRef = useRef<FlipBookRef | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    useImperativeHandle(ref, () => ({
      flipToPage: (index: number) => {
        flipRef.current?.pageFlip().flip(index);
      },
    }));

    useEffect(() => {
      if (stopAutoflip) return;

      const interval = setInterval(() => {
        if (!isHovered && flipRef.current) {
          const flip = flipRef.current.pageFlip();
          const current = flip.getCurrentPageIndex();
          const total = flip.getPageCount();
          current >= total - 2 ? flip.flip(0) : flip.flipNext();
        }
      }, 6000);

      return () => clearInterval(interval);
    }, [isHovered, stopAutoflip]);

    const handleReadMore = (article: Article) => {
      if (onReadMore) {
        onReadMore(article);
      } else {
        setSelectedArticle(article);
      }
    };

    const flipProps = {
      width: 500,
      height: 500,
      minWidth: 315,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1536,
      maxShadowOpacity: 0.5,
      showCover: false,
      mobileScrollSupport: false,
      size: 'fixed',
      drawShadow: false,
      flippingTime: 1200,
      usePortrait: false,
      clickEventForward: true,
      disableFlipByClick: false,
      showPageCorners: false,
      useMouseEvents: true,
      autoSize: false,
      swipeDistance: 30,
      startPage: 0,
      startZIndex: 0,
      renderOnlyPageLengthChange: false,
      className: styles.book,
      style: { margin: '0 auto' },
    } as ComponentProps<typeof HTMLFlipBook>; // ✅ cast to satisfy TS

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
                    onError={(e) => console.warn('Image failed to load', e)}
                  />
                </div>
                <h2 className={styles.title}>{page.title}</h2>
                <hr className={styles.divider} />
                <p className={styles.author}>By {page.author}</p>
                <p className={styles.summary}>{page.summary}</p>
                <p
                  className={styles.readMore}
                  onClick={() => handleReadMore(page)}
                >
                  Read More <span className={styles.arrow}>→</span>
                </p>
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {selectedArticle && !onReadMore && (
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
