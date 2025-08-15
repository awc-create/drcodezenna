import type { BlogPost, TeachingPost } from '@/types';
import { FALLBACK_BLOGS, FALLBACK_TEACHING } from './fallback';

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await getJSON<BlogPost[]>('/api/blog');
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_BLOGS;
  } catch {
    return FALLBACK_BLOGS;
  }
}

export async function getAllTeachingPosts(): Promise<TeachingPost[]> {
  try {
    const data = await getJSON<TeachingPost[]>('/api/teaching');
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_TEACHING;
  } catch {
    return FALLBACK_TEACHING;
  }
}
