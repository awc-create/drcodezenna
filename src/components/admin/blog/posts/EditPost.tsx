'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EditLightbox from './EditLightbox';

export default function EditPost() {
  const { id } = useParams();
  const [form, setForm] = useState({
    id: '',
    title: '',
    author: 'Dr Odera Ezenna',
    summary: '',
    content: '',
    image: ''
  });

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/blog/${id}`);
      const data = await res.json();

      setForm({
        id: data.id || '',
        title: data.title || '',
        author: data.author || 'Dr Odera Ezenna',
        summary: data.summary || '',
        content: data.content || '',
        image: data.image || '',
      });
    };

    fetchPost();
  }, [id]);

  const handleUpdatePost = async () => {
    await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    alert('Post updated!');
  };

  return (
    <>
      {form.title && (
        <EditLightbox
          post={form}
          onClose={() => history.back()}
          onSave={handleUpdatePost}
        />
      )}
    </>
  );
}
