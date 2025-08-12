'use client';

import { useRef, useState, useEffect } from 'react';
import HeroHeader from '@/components/hero/HeroHeader';
import BookFlip, { BookFlipHandle } from '@/components/blog/bookflip/BookFlip';
import PostListSelector from '@/components/blog/postlist/PostListSelector';
import LightboxArticle from '@/components/blog/article/ArticleLightbox';
import FlipHint from '@/components/blog/controls/FlipHint'; // ← NEW
import styles from './Blog.module.scss';
import { BlogPost } from '@/types';
import { getAllBlogPosts } from '@/utils/api';
import { useHeroData } from '@/hooks/useHeroData';

export default function BlogClient() {
  const flipRef = useRef<BookFlipHandle>(null);
  const [stopAutoflip, setStopAutoflip] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  const { subtitle } = useHeroData('blog');

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getAllBlogPosts();
      setAllPosts(data);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelect = (index: number) => {
    setStopAutoflip(true);
    setCurrentIndex(index);
    flipRef.current?.flipToPage(index);
  };

  const handleReadMore = (article: BlogPost) => setSelectedArticle(article);
  const handleCloseLightbox = () => setSelectedArticle(null);

  return (
    <main className={styles.blog}>
      <HeroHeader title="BLOG" subtitle={subtitle} />

      <hr className={styles.divider} />

      <div className={styles.blogHeaderRow}>
        <div className={styles.blogLogo}>Dr&nbsp;Codes&nbsp;Times</div>
        <PostListSelector
          posts={allPosts}
          onSelect={handleSelect}
          currentIndex={currentIndex}
        />
      </div>

      <hr className={styles.divider} />

      <BookFlip
        ref={flipRef}
        pages={allPosts}
        stopAutoflip={stopAutoflip}
        onReadMore={handleReadMore}
        isMobile={isMobile}
      />

      {isMobile && (
        <FlipHint
          onPrev={() => flipRef.current?.flipPrev?.()}
          onNext={() => flipRef.current?.flipNext?.()}
        />
      )}

      {selectedArticle && (
        <LightboxArticle
          title={selectedArticle.title}
          author={selectedArticle.author}
          image={selectedArticle.image}
          content={selectedArticle.content}
          onClose={handleCloseLightbox}
        />
      )}
    </main>
  );
}
