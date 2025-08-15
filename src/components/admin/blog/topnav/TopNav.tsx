'use client';

import styles from './TopNav.module.scss';

type Props = {
  currentView: 'add' | 'all' | 'edit';
  setCurrentView: (view: 'add' | 'all' | 'edit') => void;
};

export default function TopNav({ currentView, setCurrentView }: Props) {
  return (
    <nav className={styles.topNav}>
      <button
        onClick={() => setCurrentView('add')}
        className={currentView === 'add' ? styles.active : ''}
      >
        ➕ Add Post
      </button>
      <button
        onClick={() => setCurrentView('all')}
        className={currentView === 'all' ? styles.active : ''}
      >
        📄 View All
      </button>
    </nav>
  );
}
