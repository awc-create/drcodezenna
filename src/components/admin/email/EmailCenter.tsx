// src/components/admin/email/EmailCenter.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './EmailCenter.module.scss';
import { toast } from 'sonner';

type Interest = 'Blog' | 'Teaching';

type BlogPost = { id: string; title: string; createdAt?: string };
type TeachingPost = { id: string; title: string; createdAt?: string };

type Period = 'week' | 'month' | 'custom';

export default function EmailCenter() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // form state
  const [introMessage, setIntroMessage] = useState('');
  const [subject, setSubject] = useState('The Code Times — Digest');
  const [period, setPeriod] = useState<Period>('week');
  const [start, setStart] = useState<string>(''); // YYYY-MM-DD
  const [end, setEnd] = useState<string>('');     // YYYY-MM-DD
  const [interests, setInterests] = useState<Interest[]>(['Blog', 'Teaching']);

  // data
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [allTeaching, setAllTeaching] = useState<TeachingPost[]>([]);
  const [selectedBlogIds, setSelectedBlogIds] = useState<Set<string>>(new Set());
  const [selectedTeachingIds, setSelectedTeachingIds] = useState<Set<string>>(new Set());

  // fetch posts/teaching (expects /api/blog and /api/teaching to return arrays incl. id,title,createdAt)
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [br, tr] = await Promise.all([fetch('/api/blog'), fetch('/api/teaching')]);
        const blogs: any[] = await br.json();
        const teach: any[] = await tr.json();
        setAllBlogs((Array.isArray(blogs) ? blogs : []).map(b => ({ id: b.id, title: b.title, createdAt: b.createdAt })));
        setAllTeaching((Array.isArray(teach) ? teach : []).map(t => ({ id: t.id, title: t.title, createdAt: t.createdAt })));

        // preselect week after load
        setTimeout(() => autoSelectByPeriod('week'), 0);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // computed label for masthead subline
  const periodLabel = useMemo(() => {
    if (period === 'custom' && start && end) {
      return labelFromRange(new Date(start), new Date(end));
    }
    if (period === 'week') {
      const { from, to } = currentWeekRange();
      return `Week of ${fmtDay(from)}–${fmtDay(to)}`;
    }
    if (period === 'month') {
      const d = new Date();
      return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    return '';
  }, [period, start, end]);

  function toggleInterest(i: Interest) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  function setAll(setter: React.Dispatch<React.SetStateAction<Set<string>>>, allIds: string[], on: boolean) {
    setter(new Set(on ? allIds : []));
  }

  function autoSelectByPeriod(which: Period) {
    setPeriod(which);
    let from: Date, to: Date;
    if (which === 'week') ({ from, to } = currentWeekRange());
    else if (which === 'month') ({ from, to } = currentMonthRange());
    else return; // custom: user picks dates

    const inRange = (iso?: string) => {
      if (!iso) return true; // if API lacks dates, include all
      const d = new Date(iso);
      return d >= from && d <= to;
    };

    setSelectedBlogIds(new Set(allBlogs.filter(b => inRange(b.createdAt)).map(b => b.id)));
    setSelectedTeachingIds(new Set(allTeaching.filter(t => inRange(t.createdAt)).map(t => t.id)));
  }

  const canSend = useMemo(() => {
    return !!introMessage.trim() && (selectedBlogIds.size > 0 || selectedTeachingIds.size > 0) && interests.length > 0;
  }, [introMessage, selectedBlogIds, selectedTeachingIds, interests]);

  async function onSend() {
    if (!canSend) {
      toast.error('Add a message and select at least one item & audience.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests,
          subject,
          introMessage,
          periodLabel,
          blogIds: Array.from(selectedBlogIds),
          teachingIds: Array.from(selectedTeachingIds),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Send failed');
      }
      toast.success('Digest sent (or queued) to subscribers!');
    } catch (e: any) {
      toast.error(e?.message || 'Send failed');
    } finally {
      setSending(false);
    }
  }

  // date helpers
  function currentWeekRange() {
    const now = new Date();
    const day = now.getDay(); // 0 Sun – 6 Sat
    const from = new Date(now); from.setDate(now.getDate() - day);
    const to = new Date(from); to.setDate(from.getDate() + 6);
    from.setHours(0,0,0,0); to.setHours(23,59,59,999);
    return { from, to };
  }
  function currentMonthRange() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    from.setHours(0,0,0,0); to.setHours(23,59,59,999);
    return { from, to };
  }
  function fmtDay(d: Date) { return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function labelFromRange(a: Date, b: Date) { return `${fmtDay(a)}–${fmtDay(b)}`; }

  return (
    <section className={styles.wrap}>
      <h2>Email — Digest</h2>
      <p className={styles.help}>Write a short intro, pick posts, choose the period, and send.</p>

      {/* Audience */}
      <fieldset className={styles.fieldset}>
        <legend>Audience</legend>
        <label>
          <input type="checkbox" checked={interests.includes('Blog')} onChange={() => toggleInterest('Blog')} />
          Blog subscribers
        </label>
        <label>
          <input type="checkbox" checked={interests.includes('Teaching')} onChange={() => toggleInterest('Teaching')} />
          Teaching subscribers
        </label>
      </fieldset>

      {/* Subject */}
      <label className={styles.block}>
        <span>Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>

      {/* Intro */}
      <label className={styles.block}>
        <span>Custom message</span>
        <textarea rows={4} value={introMessage} onChange={(e) => setIntroMessage(e.target.value)} placeholder="Short note from Dr. Odera…" />
      </label>

      {/* Period */}
      <div className={styles.grid3}>
        <label className={styles.block}>
          <span>Period</span>
          <select value={period} onChange={(e) => autoSelectByPeriod(e.target.value as Period)}>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        {period === 'custom' && (
          <>
            <label className={styles.block}>
              <span>From</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className={styles.block}>
              <span>To</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </>
        )}
      </div>

      <p className={styles.periodLabel}>Label: <strong>{periodLabel || '—'}</strong></p>

      <div className={styles.cols}>
        {/* BLOG LIST */}
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <h3>Blog posts</h3>
            <div className={styles.actionsMini}>
              <button type="button" onClick={() => setAll(setSelectedBlogIds, allBlogs.map(b => b.id), true)}>Select all</button>
              <button type="button" onClick={() => setAll(setSelectedBlogIds, allBlogs.map(b => b.id), false)}>Clear</button>
            </div>
          </div>
          <div className={styles.list}>
            {loading && <p>Loading…</p>}
            {!loading && allBlogs.length === 0 && <p className={styles.muted}>No posts found.</p>}
            {!loading && allBlogs.map((b) => (
              <label key={b.id} className={styles.row}>
                <input
                  type="checkbox"
                  checked={selectedBlogIds.has(b.id)}
                  onChange={(e) => {
                    const next = new Set(selectedBlogIds);
                    e.target.checked ? next.add(b.id) : next.delete(b.id);
                    setSelectedBlogIds(next);
                  }}
                />
                <span className={styles.title}>{b.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* TEACHING LIST */}
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <h3>Teaching</h3>
            <div className={styles.actionsMini}>
              <button type="button" onClick={() => setAll(setSelectedTeachingIds, allTeaching.map(t => t.id), true)}>Select all</button>
              <button type="button" onClick={() => setAll(setSelectedTeachingIds, allTeaching.map(t => t.id), false)}>Clear</button>
            </div>
          </div>
          <div className={styles.list}>
            {loading && <p>Loading…</p>}
            {!loading && allTeaching.length === 0 && <p className={styles.muted}>No items found.</p>}
            {!loading && allTeaching.map((t) => (
              <label key={t.id} className={styles.row}>
                <input
                  type="checkbox"
                  checked={selectedTeachingIds.has(t.id)}
                  onChange={(e) => {
                    const next = new Set(selectedTeachingIds);
                    e.target.checked ? next.add(t.id) : next.delete(t.id);
                    setSelectedTeachingIds(next);
                  }}
                />
                <span className={styles.title}>{t.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sendBar}>
        <button onClick={onSend} disabled={!canSend || sending}>
          {sending ? 'Sending…' : 'Send digest'}
        </button>
        <span className={styles.summary}>
          {selectedBlogIds.size} blog • {selectedTeachingIds.size} teaching • to {interests.join(' + ')}
        </span>
      </div>

      <p className={styles.note}>Masthead + logo are included automatically in the email template.</p>
    </section>
  );
}
