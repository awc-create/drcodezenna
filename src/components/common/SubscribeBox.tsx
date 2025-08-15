'use client';

import { useState } from 'react';
import styles from './SubscribeBox.module.scss';
import { toast } from 'sonner';

const availableInterests = ['Blog', 'Teaching'];

export default function SubscribeBox() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const handleInterestChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || interests.length === 0) {
      toast.error('Please provide an email and select at least one interest.');
      return;
    }

    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: name || 'Anonymous',
        interests,
        location: '',
      }),
    });

    if (res.ok) {
      toast.success('Subscribed successfully!');
      setEmail('');
      setName('');
      setInterests([]);
    } else {
      toast.error('Subscription failed.');
    }
  };

  return (
    <form className={styles.subscribeBox} onSubmit={handleSubmit}>
      <h4>Stay updated</h4>
      <p>Subscribe to updates on blog posts and teaching announcements.</p>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <fieldset className={styles.checkboxGroup}>
        <legend>Select interests</legend>
        <div className={styles.checkboxRow}>
          {availableInterests.map((interest) => (
            <label key={interest}>
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => handleInterestChange(interest)}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit">Subscribe</button>
    </form>
  );
}
