'use client';

import styles from './DeleteConfirmModal.module.scss';
import type { TeachingPost } from '@/types';

interface Props {
  post: TeachingPost;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function DeleteConfirmModal({ post, onClose, onDelete }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Confirm Deletion</h3>
        <p>
          Are you sure you want to delete <strong>{post.title}</strong>?
        </p>
        <div className={styles.buttons}>
          <button onClick={onDelete}>Yes, delete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
