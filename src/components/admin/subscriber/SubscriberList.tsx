'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './Subscribers.module.scss';
import { exportToCSV } from '@/utils/exportToCSV';
import type { Subscriber } from '@/types';

type Props = {
  onEdit: (subscriber: Subscriber) => void;
  onUpdateCount: (count: number) => void;
};

export default function SubscriberList({ onEdit, onUpdateCount }: Props) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/subscribers');
      const data: Subscriber[] = await res.json();
      const list = Array.isArray(data) ? data : [];
      setSubscribers(list);
      onUpdateCount(list.length);
      const maxPage = Math.max(1, Math.ceil(list.length / pageSize));
      if (page > maxPage) setPage(maxPage);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
      setSubscribers([]);
      onUpdateCount(0);
      setPage(1);
    }
  }, [onUpdateCount, page, pageSize]);

  const deleteSubscriber = useCallback(
    async (id: string) => {
      if (!confirm('Delete this subscriber?')) return;
      try {
        setLoading(true);
        await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
        await fetchSubscribers();
      } catch (err) {
        console.error('Failed to delete subscriber:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchSubscribers]
  );

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Derived pagination values
  const total = subscribers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);

  const paged = useMemo(
    () => subscribers.slice(startIdx, endIdx),
    [subscribers, startIdx, endIdx]
  );

  // When pageSize changes, reset to page 1 to avoid empty pages
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  return (
    <div>
      <div className={styles.toolbar}>
        <button
          className={styles.exportButton}
          onClick={() =>
            exportToCSV(subscribers, 'subscribers.csv', {
              columns: [
                { key: 'email', header: 'Email' },
                { key: 'name', header: 'Name', format: v => (typeof v === 'string' ? v : '') },
                { key: 'location', header: 'Location', format: v => (typeof v === 'string' ? v : '') },
                { key: 'interests', header: 'Interests', format: v => (Array.isArray(v) ? v.join(' | ') : '') },
                { key: 'subscribedAt', header: 'Subscribed', format: v => (v ? new Date(String(v)).toISOString() : '') },
              ],
              includeBOM: true,
            })
          }
          disabled={subscribers.length === 0}
          title={subscribers.length === 0 ? 'No subscribers to export' : 'Export CSV'}
        >
          ⬇ Export CSV
        </button>

        <div className={styles.paginationControls} role="navigation" aria-label="Pagination">
          <span className={styles.rowsLabel}>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={styles.pageSizeSelect}
            aria-label="Rows per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <span className={styles.countLabel}>
            {total === 0 ? '0 results' : `Showing ${startIdx + 1}–${endIdx} of ${total}`}
          </span>

          <div className={styles.pageButtons}>
            <button onClick={() => setPage(1)} disabled={page === 1} aria-label="First page">⏮</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">←</button>
            <span className={styles.pageIndicator} aria-live="polite">
              Page {page} / {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">→</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Last page">⏭</button>
          </div>
        </div>
      </div>

      {/* ===== Desktop table ===== */}
      <div className={styles.desktopTable}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Name</th>
                <th scope="col">Location</th>
                <th scope="col">Interests</th>
                <th scope="col">Subscribed</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.email}</td>
                  <td>{sub.name || '-'}</td>
                  <td className="col-location">{sub.location || '-'}</td>
                  <td className="col-interests">
                    {Array.isArray(sub.interests) && sub.interests.length ? sub.interests.join(', ') : '-'}
                  </td>
                  <td>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : '-'}</td>
                  <td className="col-actions">
                    <button
                      onClick={() => onEdit(sub)}
                      className={styles.editButton}
                      disabled={loading}
                      title="Edit subscriber"
                      aria-label={`Edit ${sub.email}`}
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => deleteSubscriber(sub.id)}
                      className={styles.deleteButton}
                      disabled={loading}
                      title="Delete subscriber"
                      aria-label={`Delete ${sub.email}`}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}

              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Mobile cards ===== */}
      <div className={styles.mobileCards} role="list">
        {paged.length === 0 && (
          <div className={styles.card} role="listitem" aria-live="polite">
            No subscribers found.
          </div>
        )}

        {paged.map((sub) => (
          <article key={sub.id} className={styles.card} role="listitem">
            <header className={styles.cardHeader}>
              <div className="emailWrap">
                <div className="srOnly">Email</div>
                <div className="email">{sub.email}</div>
              </div>
              <div className="actions">
                <button
                  onClick={() => onEdit(sub)}
                  className={styles.editButton}
                  disabled={loading}
                  title="Edit subscriber"
                  aria-label={`Edit ${sub.email}`}
                >
                  ✏
                </button>
                <button
                  onClick={() => deleteSubscriber(sub.id)}
                  className={styles.deleteButton}
                  disabled={loading}
                  title="Delete subscriber"
                  aria-label={`Delete ${sub.email}`}
                >
                  🗑
                </button>
              </div>
            </header>

            <div className={styles.metaGrid}>
              <div className="field">
                <div className="label">Name</div>
                <div className="value">{sub.name || '-'}</div>
              </div>

              <div className="field">
                <div className="label">Location</div>
                <div className="value">{sub.location || '-'}</div>
              </div>

              <div className="field fieldInterests">
                <div className="label">Interests</div>
                <div className="value">
                  {Array.isArray(sub.interests) && sub.interests.length ? sub.interests.join(', ') : '-'}
                </div>
              </div>
            </div>

            <div className={styles.subLine}>
              Subscribed: {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : '-'}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
