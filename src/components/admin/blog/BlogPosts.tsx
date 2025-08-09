'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Media } from '@prisma/client';
import type { BlogPost } from '@/types';
import styles from './BlogPosts.module.scss';
import { blogSchema } from '@/schemas/blog';
import { toast } from 'sonner';
import ImageUploader from './ImageUploader';
import TopNav from './topnav/TopNav';
import AllPosts from './posts/AllPosts';

type MediaLite = Pick<Media, 'id' | 'url' | 'name'>;

function isMediaLite(value: unknown): value is MediaLite {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.url === 'string' &&
    (typeof v.name === 'string' || typeof v.name === 'undefined' || v.name === null)
  );
}

export default function BlogPosts() {
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    image: '',
  });

  const [errors, setErrors] = useState({
    title: '',
    summary: '',
    content: '',
    image: '',
  });

  const [mediaGallery, setMediaGallery] = useState<MediaLite[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [galleryPage, setGalleryPage] = useState(1);
  const [currentView, setCurrentView] = useState<'add' | 'all' | 'edit'>('add');
  const [editPost] = useState<BlogPost | null>(null); // kept for future "edit" view

  const pageSize = 6;
  const startIndex = (galleryPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/media');
      const json: unknown = await res.json();

      if (!Array.isArray(json)) {
        console.error('❌ /api/media did not return an array:', json);
        toast.error('Failed to load media gallery.');
        return;
      }

      // ✅ no `any` — proper type guard
      const typed = json.filter(isMediaLite);

      // ✅ no `as const` — type the tuple + Map generics
      const unique = Array.from(
        new Map<string, MediaLite>(
          typed.map((item): [string, MediaLite] => [item.url, item])
        ).values()
      );

      setMediaGallery(unique);
    } catch (err) {
      console.error('Error fetching media:', err);
      toast.error('Something went wrong while loading media.');
    }
  };

  useEffect(() => {
    void fetchGallery();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = blogSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0] || 'Title is required',
        summary: fieldErrors.summary?.[0] || 'Summary is required',
        content: fieldErrors.content?.[0] || 'Content is required',
        image: fieldErrors.image?.[0] || 'Image is required',
      });
      toast.error('Please complete all required fields');
      return;
    }

    setErrors({ title: '', summary: '', content: '', image: '' });

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(result?.error || 'Something went wrong');
        return;
      }

      toast.success('Blog post published!');
      setForm({ title: '', summary: '', content: '', image: '' });
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Something went wrong while publishing');
    }
  };

  return (
    <section className={styles.section}>
      <h2>Blog Manager</h2>

      <TopNav currentView={currentView} setCurrentView={setCurrentView} />

      {currentView === 'add' && (
        <>
          <div className={styles.toggleButtons}>
            <button type="button" onClick={() => setShowPreview((prev) => !prev)}>
              {showPreview ? 'Back to Form' : 'Preview Post'}
            </button>
            {showPreview && (
              <button type="button" onClick={() => setIsMobilePreview((prev) => !prev)}>
                {isMobilePreview ? 'Desktop View' : 'Mobile View'}
              </button>
            )}
          </div>

          {showPreview ? (
            <div className={isMobilePreview ? styles.mobilePreview : styles.desktopPreview}>
              <h3>{form.title || 'Untitled post'}</h3>
              <p>
                <strong>Dr Odera Ezenna</strong>
              </p>
              <p>{form.summary}</p>
              {form.image && (
                <Image
                  src={form.image}
                  alt="Blog post preview"
                  width={600}
                  height={400}
                  className={styles.preview}
                />
              )}
              <p>{form.content}</p>
            </div>
          ) : (
            <div className={styles.editorLayout}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  Title
                  <input name="title" value={form.title} onChange={handleChange} />
                  {errors.title && <span className={styles.error}>{errors.title}</span>}
                </label>

                <p>
                  <strong>Dr Odera Ezenna</strong>
                </p>

                <label>
                  Summary
                  <input name="summary" value={form.summary} onChange={handleChange} />
                  {errors.summary && <span className={styles.error}>{errors.summary}</span>}
                </label>

                <label>
                  Content
                  <textarea name="content" rows={6} value={form.content} onChange={handleChange} />
                  {errors.content && <span className={styles.error}>{errors.content}</span>}
                </label>

                <div className={styles.uploadSection}>
                  <div className={styles.uploaderWrapper}>
                    <ImageUploader
                      onUpload={(url) => {
                        setForm((prev) => ({ ...prev, image: url }));
                        toast.success('Image uploaded!');
                        void fetchGallery();
                      }}
                    />
                    {errors.image && <span className={styles.error}>{errors.image}</span>}
                  </div>

                  {form.image && (
                    <div className={styles.previewWrapper}>
                      <p>Uploaded Image Preview:</p>
                      <Image
                        src={form.image}
                        alt="Uploaded blog image"
                        width={400}
                        height={250}
                        className={styles.preview}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    !form.title.trim() || !form.summary.trim() || !form.content.trim() || !form.image
                  }
                >
                  Publish Post
                </button>
              </form>

              <aside className={styles.galleryPanel}>
                <p>Select from uploaded images:</p>
                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    onClick={() => setGalleryPage((p) => Math.max(1, p - 1))}
                    disabled={galleryPage === 1}
                    aria-label="Previous page"
                  >
                    ←
                  </button>
                  <span>Page {galleryPage}</span>
                  <button
                    type="button"
                    onClick={() => setGalleryPage((p) => p + 1)}
                    disabled={endIndex >= mediaGallery.length}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>

                <div className={styles.galleryGrid}>
                  {mediaGallery.slice(startIndex, endIndex).map((img) => (
                    <Image
                      key={img.id}
                      src={img.url}
                      alt={img.name || 'Media thumbnail'}
                      width={100}
                      height={100}
                      className={`${styles.thumbnail} ${form.image === img.url ? styles.selected : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, image: img.url }))}
                    />
                  ))}
                </div>
              </aside>
            </div>
          )}
        </>
      )}

      {currentView === 'all' && <AllPosts />}

      {currentView === 'edit' && editPost && (
        <div>
          <p>TODO: Edit form for blog post: {editPost.title}</p>
        </div>
      )}
    </section>
  );
}
