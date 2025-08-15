'use client';

import styles from './DeleteConfirmModal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this blog post?</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm}>Yes, Delete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
