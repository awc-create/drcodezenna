'use client';

import { useRef, useState } from 'react';
import HeroHeader from '@/components/hero/HeroHeader';
import BookFlip, { BookFlipHandle } from '@/components/blog/bookflip/BookFlip';
import PostListSelector from '@/components/blog/postlist/PostListSelector';
import LightboxArticle from '@/components/blog/article/ArticleLightbox';
import styles from './Blog.module.scss';
import NewspaperScroll from '@/components/blog/mobile/NewspaperScroll';
import { useEffect } from 'react';

const allPosts = [
  {
    title: 'The Ice Cream Sundae Must Be Stopped',
    author: 'Dr Odera Ezenna',
    summary:
      "This childhood treat has stormed New York restaurant menus. Our critic isn’t having it.",
    image: '/assets/fallback-blog.jpeg',
    content: `
Once a nostalgic dessert reserved for children’s birthdays and retro diners, the ice cream sundae has now taken over New York’s upscale menus. At establishments like SweetForge and Brasserie Belle, you'll find sundaes dripping with saffron cream, edible gold, and 10-scoop towers designed more for Instagram than indulgence.

The result? A dessert that feels bloated, forced, and fundamentally disconnected from its roots. What was once simple joy has become spectacle. The cherry on top now competes with truffle dust and freeze-dried marshmallows.

Have we gone too far?

Chefs argue this is evolution — a celebration of creativity. But in the race for visual appeal, we’ve lost flavor integrity. A real sundae should melt. It should be messy. And it shouldn’t cost £22.

As food trends move faster than ever, maybe the best thing we can do is... stop the sundae. Or at least bring it back down to earth.
`,
  },
  {
    title: 'How to Make Mac and Cheese',
    author: 'Dr Odera Ezenna',
    summary:
      'Mac and cheese is like a hug in a warm sweater. A homemade version is worth the effort.',
    image: '/assets/fallback-blog.jpeg',
    content: `
There's nothing quite like mac and cheese. Whether served as a main or a side, it's warm, rich, and endlessly comforting.

Start with the roux: melt butter, whisk in flour, and slowly add whole milk to build a creamy béchamel. Once thickened, stir in sharp cheddar, a bit of Gruyère, and a touch of mustard powder. Salt and black pepper round it out.

Fold in al dente pasta (elbows or shells work best), then bake it until bubbling and golden on top.

Want to level it up? Add caramelized onions, crispy bacon, or roasted garlic. For a crispy top, sprinkle breadcrumbs mixed with melted butter before baking.

Mac and cheese doesn’t need reinvention — just care. And when you make it from scratch, you’ll taste the difference in every bite.
`,
  },
  {
    title: 'Single Mother, Pioneering Photographer',
    author: 'Dr Odera Ezenna',
    summary:
      'In 1904, Bayard Wootten, a divorced single mother in North Carolina, borrowed a camera...',
    image: '/assets/fallback-blog.jpeg',
    content: `
Bayard Wootten wasn’t meant to be a photographer. Born in 1875 and divorced by 1904, she was raising two children alone in North Carolina. But a borrowed camera changed everything.

She began capturing portraits and landscapes to support her family — eventually documenting rural life in the American South. Her work stood out for its tenderness: children playing in cotton fields, weathered faces full of story, homes that seemed to breathe.

Despite facing gender bias and financial strain, she opened one of the first female-run photography studios in the South. Her photographs would go on to be published nationally, even used in campaigns for the Red Cross and state tourism.

Today, her legacy is a quiet reminder: creativity doesn’t wait for permission. And sometimes, a lens can lift a life.
`,
  },
  {
    title: 'Punk Music, Bronx Style',
    author: 'Dr Odera Ezenna',
    summary:
      'Roy Baizan chronicles the punk and hip-hop scene in the Bronx, including Hydro Punk.',
    image: '/assets/fallback-blog.jpeg',
    content: `
In the heart of the Bronx, a new movement is reshaping punk.

Photographer Roy Baizan has spent years embedded in Hydro Punk — a grassroots DIY scene where Latinx and Black punk fans reclaim space and sound. Gigs happen in basements, community centers, and public parks. No sponsors. No bouncers. Just energy and sweat and raw noise.

But it’s more than music. It’s activism. These shows double as fundraisers for bailouts, food drives, and mutual aid. Zines are passed out between sets. Protest chants blend with bass riffs.

Baizan's photos capture it all: the chaos, the connection, the politics. Mohawks meet megaphones. Mosh pits meet mutual aid.

This is punk without industry. Punk that’s not performative. And in a world of algorithmic art, it's a sound that still feels like rebellion.
`,
  },
];

export default function BlogClient() {
  const flipRef = useRef<BookFlipHandle>(null);
  const [stopAutoflip, setStopAutoflip] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<typeof allPosts[0] | null>(null);

  const handleSelect = (index: number) => {
    setStopAutoflip(true);
    setCurrentIndex(index);
    flipRef.current?.flipToPage(index);
  };

  const handleReadMore = (article: typeof allPosts[0]) => {
    setSelectedArticle(article);
  };

  const handleCloseLightbox = () => {
    setSelectedArticle(null);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className={styles.blog}>
      <HeroHeader title="BLOG" subtitle="Writing that turns the page" />
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

        {isMobile ? (
      <NewspaperScroll posts={allPosts} onReadMore={handleReadMore} />
    ) : (
      <BookFlip
        ref={flipRef}
        pages={allPosts}
        stopAutoflip={stopAutoflip}
        onReadMore={handleReadMore}
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
