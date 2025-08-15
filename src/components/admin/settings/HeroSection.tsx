'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './HeroSettings.module.scss';
import ImageUploader from '../blog/ImageUploader';
import { toast } from 'sonner';

type PageType = 'home' | 'biography' | 'teaching' | 'blog';

export default function HeroSettings() {
  const [selectedPage, setSelectedPage] = useState<PageType>('home');

  const [form, setForm] = useState({
    image: '',
    subtitles: {
      home: '',
      biography: '',
      teaching: '',
      blog: '',
    },
    bios: {
      home: '',
      biography: '', // will store as 'intro||rest'
    },
  });

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      subtitles: {
        ...prev.subtitles,
        [selectedPage]: value,
      },
    }));
  };

  const handleHomeBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      bios: {
        ...prev.bios,
        home: value,
      },
    }));
  };

  const handleBioIntroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const intro = e.target.value;
    const rest = form.bios.biography.split('||')[1] || '';
    setForm((prev) => ({
      ...prev,
      bios: {
        ...prev.bios,
        biography: `${intro}||${rest}`,
      },
    }));
  };

  const handleBioRestChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rest = e.target.value;
    const intro = form.bios.biography.split('||')[0] || '';
    setForm((prev) => ({
      ...prev,
      bios: {
        ...prev.bios,
        biography: `${intro}||${rest}`,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      toast.success('Hero settings updated!');
    } catch {
      toast.error('Failed to update hero settings');
    }
  };

  return (
    <section className={styles.section}>
      <h2>Hero Section</h2>
      <p>Update the shared hero image and per-page subtitles and bios.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Page
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value as PageType)}
          >
            <option value="home">Home</option>
            <option value="biography">Biography</option>
            <option value="teaching">Teaching</option>
            <option value="blog">Blog</option>
          </select>
        </label>

        <label>
          Subtitle for {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}
          <input
            name={`subtitle-${selectedPage}`}
            value={form.subtitles[selectedPage]}
            onChange={handleSubtitleChange}
          />
        </label>

        {selectedPage === 'home' && (
          <label>
            Introduction Text
            <textarea
              name="bio-home"
              value={form.bios.home}
              onChange={handleHomeBioChange}
              rows={6}
            />
          </label>
        )}

        {selectedPage === 'biography' && (
          <>
            <label>
              Biography Introduction
              <textarea
                name="bio-biography-intro"
                value={form.bios.biography.split('||')[0] || ''}
                onChange={handleBioIntroChange}
                rows={3}
              />
            </label>

            <label>
              Rest of Biography
              <textarea
                name="bio-biography-rest"
                value={form.bios.biography.split('||')[1] || ''}
                onChange={handleBioRestChange}
                rows={5}
              />
            </label>
          </>
        )}

        <label>Shared Hero Image</label>
        <ImageUploader
          onUpload={(url) => {
            setForm((prev) => ({ ...prev, image: url }));
            toast.success('Image uploaded!');
          }}
        />

        {form.image && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Preview:</strong></p>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400, height: 250 }}>
              <Image
                src={form.image}
                alt="Hero"
                fill
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            </div>
          </div>
        )}

        <button type="submit">Update Hero</button>
      </form>
    </section>
  );
}
