import { useEffect, useState } from 'react';

type HeroSubtitle = {
  page: string;
  subtitle: string;
};

type HeroBio = {
  page: string;
  content: string;
};

type HeroData = {
  image: string;
  subtitles: HeroSubtitle[];
  bios: HeroBio[];
};

export function useHeroContent(page: string) {
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch('/api/hero');
        const data: HeroData = await res.json();

        const subtitleEntry = data.subtitles.find(s => s.page === page);
        const bioEntry = data.bios.find(b => b.page === page);

        setSubtitle(subtitleEntry?.subtitle ?? null);
        setBio(bioEntry?.content ?? null);
        setImage(data.image ?? null);
      } catch (err) {
        console.error('Failed to fetch hero content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, [page]);

  return { subtitle, bio, image, loading };
}
