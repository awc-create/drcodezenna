'use client';

import { useState } from 'react';
import styles from './Subscribers.module.scss';
import { toast } from 'sonner';

export default function SubscriberForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });

    if (res.ok) {
      toast.success('Subscriber added!');
      setEmail('');
      setName('');
    } else {
      toast.error('Could not add subscriber');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>
        Email
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Name (optional)
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <button type="submit">Add Subscriber</button>
    </form>
  );
}
