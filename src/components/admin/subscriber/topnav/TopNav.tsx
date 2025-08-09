'use client';

import styles from './TopNav.module.scss';

type Props = {
  count?: number;
};

export default function TopNav({ count }: Props) {
  return (
    <nav className={styles.topNav}>
      <h3 className={styles.heading}>
        Subscribers {count !== undefined ? `(${count})` : ''}
      </h3>
    </nav>
  );
}
