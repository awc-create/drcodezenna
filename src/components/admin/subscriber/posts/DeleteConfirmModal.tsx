'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import styles from './DeleteConfirmModal.module.scss';
import type { TeachingPost } from '@/types';

interface Props {
  post: TeachingPost;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function DeleteConfirmModal({ post, onClose, onDelete }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<Element | null>(null);

  // Save and restore focus
  useLayoutEffect(() => {
    previouslyFocused.current = document.activeElement;
    return () => {
      if (
        previouslyFocused.current instanceof HTMLElement &&
        document.contains(previouslyFocused.current)
      ) {
        previouslyFocused.current.focus({ preventScroll: true });
      }
    };
  }, []);

  // Initial focus to the first actionable control
  useEffect(() => {
    firstFocusRef.current?.focus({ preventScroll: true });
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // Focus trap: keep tabbing within the modal
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const selector =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
      '[tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(el.querySelectorAll<HTMLElement>(selector))
        .filter(node => node.offsetParent !== null || node === document.activeElement); // visible
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stop clicks inside modal from closing
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      <div className={styles.modal} onClick={stop} ref={modalRef}>
        <h3 id="delete-modal-title">Confirm Deletion</h3>
        <p id="delete-modal-desc">
          Are you sure you want to delete <strong>{post.title}</strong>?
        </p>
        <div className={styles.buttons}>
          <button ref={firstFocusRef} onClick={onDelete}>
            Yes, delete
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
