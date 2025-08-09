'use client';

import { useState } from 'react';
import styles from './EditSubscriberLightbox.module.scss';
import { toast } from 'sonner';
import type { Subscriber } from '@/types';

type Props = {
  subscriber: Subscriber;
  onClose: () => void;
};

export default function EditSubscriberLightbox({ subscriber, onClose }: Props) {
  const [form, setForm] = useState({ ...subscriber });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, interests: e.target.value.split(',').map(tag => tag.trim()) });
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/subscribers/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success('Subscriber updated!');
      onClose();
    } else {
      toast.error('Update failed.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Edit Subscriber</h3>
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Location
          <input name="location" value={form.location || ''} onChange={handleChange} />
        </label>
        <label>
          Interests
          <input value={form.interests.join(', ')} onChange={handleTags} />
        </label>

        <div className={styles.actions}>
          <button onClick={handleSubmit}>💾 Save</button>
          <button onClick={onClose}>✖ Cancel</button>
        </div>
      </div>
    </div>
  );
}
