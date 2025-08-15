'use client';

import styles from './EditLightbox.module.scss';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import ImageUploader from '@/components/admin/blog/ImageUploader'; // adjust path as needed

type Props = {
  post: {
    id: string;
    title: string;
    author: string;
    summary: string;
    content: string;
    image: string;
  };
  onClose: () => void;
  onSave: (updated: Partial<Props['post']>) => void;
};

export default function EditLightbox({ post, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    title: post.title,
    summary: post.summary,
    content: post.content,
    image: post.image,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave({ ...form, id: post.id, author: post.author });
    toast.success('Post updated!');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <hr className={styles.divider} />
        <h1 className={styles.title}>Edit Blog Post</h1>
        <hr className={styles.divider} />
        <p className={styles.byline}>Written by {post.author}</p>

        <div className={styles.contentArea}>
          <div className={styles.imageWrapper}>
            <Image
              src={form.image || '/assets/fallback-blog.jpeg'}
              alt={form.title}
              width={400}
              height={250}
              className={styles.image}
              onError={(e) => console.warn('Image failed to load', e)}
            />
            <ImageUploader
              onUpload={(url) => {
                setForm((prev) => ({ ...prev, image: url }));
                toast.success('Image updated!');
              }}
            />
          </div>

          <div className={styles.text}>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className={styles.input}
            />
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="Summary"
              className={styles.textarea}
            />
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Content"
              className={styles.textarea}
              rows={10}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.saveBtn}>💾 Save</button>
          <button onClick={onClose} className={styles.cancelBtn}>✖ Cancel</button>
        </div>
      </div>
    </div>
  );
}
