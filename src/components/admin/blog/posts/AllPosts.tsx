'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './AllPosts.module.scss';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditLightbox from './EditLightbox';

type BlogPost = {
  id: string;
  title: string;
  author: string;
  summary: string;
  content: string;
  image: string;
};

export default function AllPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;
    await fetch(`/api/blog/${selectedId}`, { method: 'DELETE' });
    setConfirmDelete(false);
    fetchPosts();
  };

  const handleUpdatePost = async (updatedPost: Partial<BlogPost>) => {
    if (!updatedPost.id) return;

    await fetch(`/api/blog/${updatedPost.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost),
    });

    setEditingPost(null);
    fetchPosts();
  };

  const handleImageError = (postId: string) => {
    setBrokenImages(prev => ({ ...prev, [postId]: true }));
  };

  return (
    <section className={styles.postsSection}>
      <h2>All Blog Posts</h2>

      <div className={styles.postsGrid}>
        {posts.map((post, index) => (
          <div key={post.id} className={styles.postCard}>
            <div className={styles.cardImageWrapper}>
              <Image
                src={brokenImages[post.id] ? '/fallback-blog.jpg' : post.image}
                alt={post.title}
                width={300}
                height={200}
                priority={index < 3}
                className={styles.cardImage}
                onError={() => handleImageError(post.id)}
              />
            </div>

            <div className={styles.cardBody}>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <div className={styles.buttonGroup}>
                <button onClick={() => setEditingPost(post)}>Edit</button>
                <button
                  onClick={() => {
                    setSelectedId(post.id);
                    setConfirmDelete(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingPost && (
        <EditLightbox
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleUpdatePost}
        />
      )}

      <DeleteConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
