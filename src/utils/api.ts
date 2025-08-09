// src/utils/api.ts
import type { BlogPost, TeachingPost } from '@/types';
import { FALLBACK_BLOGS, FALLBACK_TEACHING } from './fallback';

// Small helper to avoid stale cache while developing content
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/**
 * BLOGS:
 * - If API returns 1+ posts ⇒ return them (fallback disappears).
 * - If empty or API fails ⇒ return 4 fallback posts with public/assets/fallback-blog.jpeg.
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await getJSON<BlogPost[]>('/api/blog');
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_BLOGS;
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    return FALLBACK_BLOGS;
  }
}

/**
 * TEACHING:
 * - Same disappearing fallback rule as blogs.
 */
export async function getAllTeachingPosts(): Promise<TeachingPost[]> {
  try {
    const data = await getJSON<TeachingPost[]>('/api/teaching');
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_TEACHING;
  } catch (err) {
    console.error('Error fetching teaching posts:', err);
    return FALLBACK_TEACHING;
  }
}
