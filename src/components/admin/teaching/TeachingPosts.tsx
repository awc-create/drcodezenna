'use client';

import { useEffect, useState } from 'react';
import styles from './TeachingPosts.module.scss';
import TopNav from '@/components/admin/blog/topnav/TopNav';
import EditLightbox from './posts/EditLightbox';
import DeleteConfirmModal from './posts/DeleteConfirmModal';
import type { TeachingPost } from '@/types';

type TeachingPostForm = Omit<TeachingPost, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export default function TeachingPosts() {
  const [posts, setPosts] = useState<TeachingPost[]>([]);
  const [form, setForm] = useState<TeachingPostForm>({
    title: '',
    school: '',
    year: '',
    type: '',
    isCurrent: false,
    tags: [],
    description: '',
    fullText: '',
    startDate: '',
    endDate: '',
  });

  const [filters, setFilters] = useState({
    year: '',
    school: '',
    tag: '',
    isCurrent: '',
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    years: [] as string[],
    schools: [] as string[],
    tags: [] as string[],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<'add' | 'all' | 'edit'>('all');

  const [selectedPost, setSelectedPost] = useState<TeachingPost | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/teaching');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid response');

      setPosts(data);

      const uniqueYears = [...new Set(data.map((p) => p.year))];
      const uniqueSchools = [...new Set(data.map((p) => p.school))];
      const uniqueTags = [...new Set(data.flatMap((p) => p.tags))];

      setDropdownOptions({
        years: uniqueYears,
        schools: uniqueSchools,
        tags: uniqueTags,
      });
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/teaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await fetchPosts();
      setForm({
        title: '',
        school: '',
        year: '',
        type: '',
        isCurrent: false,
        tags: [],
        description: '',
        fullText: '',
        startDate: '',
        endDate: '',
      });
      setCurrentView('all');
    } else {
      const error = await res.json();
      console.error('Error:', error);
    }
  };

  const handleEditSave = async (updated: Partial<TeachingPost>) => {
    const res = await fetch(`/api/teaching/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    if (res.ok) {
      setShowEdit(false);
      setSelectedPost(null);
      await fetchPosts();
    } else {
      console.error('Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!selectedPost?.id) return;
    const res = await fetch(`/api/teaching/${selectedPost.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setShowDelete(false);
      setSelectedPost(null);
      await fetchPosts();
    } else {
      console.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    return (
      (!filters.year || post.year === filters.year) &&
      (!filters.school || post.school === filters.school) &&
      (!filters.tag || post.tags.includes(filters.tag)) &&
      (filters.isCurrent ? post.isCurrent === (filters.isCurrent === 'true') : true)
    );
  });

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2>Teaching Manager</h2>
        <p>Add, filter, and review past or current university classes.</p>

        <TopNav currentView={currentView} setCurrentView={setCurrentView} />

        {currentView === 'add' && (
          <div className={styles.editorLayout}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Title
                <input name="title" value={form.title} onChange={handleChange} required />
              </label>
              <label>
                School
                <input
                  list="school-options"
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  required
                />
                <datalist id="school-options">
                  {dropdownOptions.schools.map((school) => (
                    <option key={school} value={school} />
                  ))}
                </datalist>
              </label>

              <label>
                Year
                <input name="year" value={form.year} onChange={handleChange} required />
              </label>
              <label>
                Type
                <select name="type" value={form.type} onChange={handleChange} required>
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
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
              </label>
              {!form.isCurrent && (
                <label>
                  End Date
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </label>
              )}
              <label>
                Tags (comma-separated)
                <input
                  list="tag-options"
                  name="tags"
                  value={form.tags.join(', ')}
                  onChange={handleTags}
                  placeholder="e.g. Media, Politics, Journalism"
                />
                <datalist id="tag-options">
                  {dropdownOptions.tags.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
              </label>

              <label>
                Short Description
                <textarea name="description" value={form.description} onChange={handleChange} required />
              </label>
              <label>
                Full Text
                <textarea name="fullText" value={form.fullText} onChange={handleChange} required />
              </label>
              <button type="submit">Add Lesson</button>
            </form>
          </div>
        )}

        {currentView === 'all' && (
          <>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={styles.toggleFilterButton}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {showFilters && (
              <div className={styles.filters}>
                <label>
                  Year
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
                  >
                    <option value="">All</option>
                    {dropdownOptions.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  School
                  <select
                    value={filters.school}
                    onChange={(e) => setFilters((prev) => ({ ...prev, school: e.target.value }))}
                  >
                    <option value="">All</option>
                    {dropdownOptions.schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tags
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
                  >
                    <option value="">All</option>
                    {dropdownOptions.tags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Currently Teaching?
                  <select
                    value={filters.isCurrent}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, isCurrent: e.target.value }))
                    }
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>

                <div className={styles.filterActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({ year: '', school: '', tag: '', isCurrent: '' })
                    }
                    className={styles.clearButton}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            <div className={styles.lessonPreview}>
              {filteredPosts.map((lesson) => (
                <div key={lesson.id} className={styles.lessonCard}>
                  <h3>{lesson.title}</h3>
                  <p className={styles.meta}>
                    {lesson.school} · {lesson.year} · {lesson.type}{' '}
                    {lesson.isCurrent && <strong>(Current)</strong>}
                  </p>
                  <p>{lesson.description}</p>
                  <small>Tags: {lesson.tags.join(', ')}</small>

                  <div className={styles.cardActions}>
                    <button
                      onClick={() => {
                        setSelectedPost(lesson);
                        setShowEdit(true);
                      }}
                      className={styles.editButton}
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPost(lesson);
                        setShowDelete(true);
                      }}
                      className={styles.deleteButton}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedPost && showEdit && (
          <EditLightbox
            post={selectedPost}
            onClose={() => {
              setShowEdit(false);
              setSelectedPost(null);
            }}
            onSave={handleEditSave}
          />
        )}

        {selectedPost && showDelete && (
          <DeleteConfirmModal
            post={selectedPost}
            onClose={() => {
              setShowDelete(false);
              setSelectedPost(null);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
}
