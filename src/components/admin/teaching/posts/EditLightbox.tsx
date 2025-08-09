'use client';

import { useState } from 'react';
import styles from './EditLightbox.module.scss';
import { toast } from 'sonner';
import type { TeachingPost } from '@/types';

interface Props {
  post: TeachingPost;
  onClose: () => void;
  onSave: (updated: Partial<TeachingPost>) => void;
}

export default function EditLightbox({ post, onClose, onSave }: Props) {
  const [form, setForm] = useState<TeachingPost>({ ...post });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = () => {
    setForm((prev) => ({
      ...prev,
      isCurrent: !prev.isCurrent,
      endDate: '',
    }));
  };

  const handleTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, tags: e.target.value.split(',').map((tag) => tag.trim()) });
  };

  const handleSubmit = () => {
    onSave(form);
    toast.success('Teaching post updated!');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Edit Teaching Post</h2>

        <div className={styles.content}>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} />
          </label>
          <label>
            School
            <input name="school" value={form.school} onChange={handleChange} />
          </label>
          <label>
            Year
            <input name="year" value={form.year} onChange={handleChange} />
          </label>
          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="Lecture">Lecture</option>
              <option value="Seminar">Seminar</option>
              <option value="Lab">Lab</option>
              <option value="Workshop">Workshop</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Studio">Studio</option>
              <option value="Colloquium">Colloquium</option>
              <option value="Fieldwork">Fieldwork</option>
              <option value="Reading Group">Reading Group</option>
              <option value="Independent Study">Independent Study</option>
            </select>
          </label>

          <label className={styles.checkbox}>
            <input type="checkbox" checked={form.isCurrent} onChange={handleCheckbox} />
            Currently Teaching
          </label>

          <label>
            Start Date
            <input type="date" name="startDate" value={form.startDate || ''} onChange={handleChange} />
          </label>
          {!form.isCurrent && (
            <label>
              End Date
              <input type="date" name="endDate" value={form.endDate || ''} onChange={handleChange} />
            </label>
          )}

          <label>
            Tags (comma-separated)
            <input value={form.tags.join(', ')} onChange={handleTags} />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>
          <label>
            Full Text
            <textarea name="fullText" value={form.fullText} onChange={handleChange} rows={8} />
          </label>
        </div>

        <div className={styles.actions}>
          <button onClick={handleSubmit}>💾 Save</button>
          <button onClick={onClose}>✖ Cancel</button>
        </div>
      </div>
    </div>
  );
}
