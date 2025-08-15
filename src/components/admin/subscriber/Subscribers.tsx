'use client';

import { useState } from 'react';
import styles from './Subscribers.module.scss';
import TopNav from './topnav/TopNav';
import SubscriberList from './SubscriberList';
import EditSubscriberLightbox from './posts/EditSubscriberLightbox';
import type { Subscriber } from '@/types';

type Props = {
  count: number;
  setCount: (n: number) => void;
};

export default function Subscribers({ count, setCount }: Props) {
  const [editing, setEditing] = useState<Subscriber | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2>Subscribers</h2>
        <p>Manage newsletter subscribers. View, delete, or export the list.</p>

        <TopNav count={count} />

        <SubscriberList onEdit={setEditing} onUpdateCount={setCount} />

        {editing && (
          <EditSubscriberLightbox
            subscriber={editing}
            onClose={() => setEditing(null)}
          />
        )}
      </div>
    </section>
  );
}
