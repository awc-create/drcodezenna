// src/app/contact/ContactClient.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './Contact.module.scss';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import mailAnim from '../../assets/lottie/mail.json'; // same as before

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('[contact] submit error:', err);
      setStatus('error');
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <h1>Let&apos;s Talk</h1>
        <p>Drop us a message and we’ll get back to you fast 🚀</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Send Message'}
          </button>

          {status === 'success' && (
            <p className={styles.success}>Message sent! We&apos;ll be in touch soon.</p>
          )}
          {status === 'error' && error && (
            <p className={styles.error}>{error}</p>
          )}
        </form>
      </div>

      <div className={styles.right}>
        <Lottie animationData={mailAnim} loop autoplay style={{ height: 300 }} />
      </div>
    </div>
  );
}
