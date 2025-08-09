// src/hooks/useHeroData.ts
'use client';

import { useEffect, useState } from 'react';
import { heroFallbacks, HeroPageKey } from '@/constants/heroFallbacks';

type HeroData = {
  image: string;
  subtitle: string;
  bio: string;
};

export function useHeroData(page: HeroPageKey) {
  const [data, setData] = useState<HeroData>({
    image: '',
    subtitle: heroFallbacks[page].subtitle,
    bio: heroFallbacks[page].bio,
  });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`/api/hero?page=${page}`);
        const result = await res.json();

        setData({
          image: result.image || '',
          subtitle: result.subtitle || heroFallbacks[page].subtitle,
          bio: result.bio || heroFallbacks[page].bio,
        });
      } catch (err) {
        console.error('Failed to load hero data:', err);
        // Keep fallback
      }
    };

    fetchHero();
  }, [page]);

  return data;
}
