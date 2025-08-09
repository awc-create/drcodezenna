// src/utils/api.ts

import type { BlogPost } from '@/types';

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/api/blog');
    if (!res.ok) {
      console.error('Failed to fetch blog posts:', res.status);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    return [];
  }
}
