'use client';

import { useState } from 'react';
import styles from './AdminClient.module.scss';

import BlogPosts from '@/components/admin/blog/BlogPosts';
import HeroSettings from '@/components/admin/settings/HeroSection';
import Subscribers from '@/components/admin/subscriber/Subscribers';
import TeachingPosts from '@/components/admin/teaching/TeachingPosts';
import EmailCenter from '@/components/admin/email/EmailCenter';

type SectionKey = 'blog' | 'hero' | 'teaching' | 'subscribers' | 'email';

const sections: { key: SectionKey; label: string }[] = [
  { key: 'blog', label: 'Blog Posts' },
  { key: 'hero', label: 'Hero Section' },
  { key: 'teaching', label: 'Teaching' },
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'email', label: 'Email' },
];

export default function AdminClient() {
  const [activeSection, setActiveSection] = useState<SectionKey>('blog');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  const renderSection = () => {
    switch (activeSection) {
      case 'hero':
        return <HeroSettings />;
      case 'subscribers':
        return <Subscribers count={subscriberCount} setCount={setSubscriberCount} />;
      case 'teaching':
        return <TeachingPosts />;
      case 'email':
        return <EmailCenter />;
      case 'blog':
      default:
        return <BlogPosts />;
    }
  };

  return (
    <div className={styles.admin}>
      <aside className={styles.sidebar}>
        <button className={styles.toggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰ Menu
        </button>

        {sidebarOpen && (
          <nav>
            <ul>
              {sections.map(({ key, label }) => (
                <li key={key}>
                  <button
                    className={activeSection === key ? styles.active : ''}
                    onClick={() => {
                      setActiveSection(key);
                      setSidebarOpen(false);
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav className={styles.desktopNav}>
          <ul>
            {sections.map(({ key, label }) => (
              <li key={key}>
                <button
                  className={activeSection === key ? styles.active : ''}
                  onClick={() => setActiveSection(key)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className={styles.content}>{renderSection()}</main>
    </div>
  );
}
