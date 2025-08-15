'use client';

import { useEffect, useState } from 'react';
import styles from './TeachingPosts.module.scss';

type TeachingPost = {
  id: string;
  title: string;
  school: string;
  year: string;
  type: string;
  isCurrent: boolean;
  tags: string[];
  description: string;
  fullText: string;
};

export default function TeachingList() {
  const [posts, setPosts] = useState<TeachingPost[]>([]);
  const [filters, setFilters] = useState({
    year: '',
    school: '',
    isCurrent: '',
    tag: '',
  });

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/teaching');
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('Unexpected API response:', data);
        throw new Error('Invalid response');
      }

      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    (filters.year ? post.year === filters.year : true) &&
    (filters.school ? post.school.toLowerCase().includes(filters.school.toLowerCase()) : true) &&
    (filters.isCurrent ? post.isCurrent === (filters.isCurrent === 'true') : true) &&
    (filters.tag ? post.tags.includes(filters.tag) : true)
  );

  return (
    <div className={styles.container}>
      <h2>All Teaching Posts</h2>

      <div className={styles.filters}>
        <input
          placeholder="Year"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        />
        <input
          placeholder="School"
          value={filters.school}
          onChange={(e) => setFilters({ ...filters, school: e.target.value })}
        />
        <select
          value={filters.isCurrent}
          onChange={(e) => setFilters({ ...filters, isCurrent: e.target.value })}
        >
          <option value="">Current?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <input
          placeholder="Tag"
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
        />
      </div>

      <div className={styles.lessonPreview}>
        {filteredPosts.length === 0 && <p>No results match your filters.</p>}

        {filteredPosts.map((lesson) => (
          <div key={lesson.id} className={styles.lessonCard}>
            <h3>{lesson.title}</h3>
            <p className={styles.meta}>
              {lesson.school} · {lesson.year} · {lesson.type}{' '}
              {lesson.isCurrent && <strong>(Current)</strong>}
            </p>
            <p>{lesson.description}</p>
            {lesson.tags.length > 0 && (
              <small>Tags: {lesson.tags.join(', ')}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
