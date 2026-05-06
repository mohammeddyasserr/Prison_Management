import React, { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const TransfersList = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const headers = { 'Authorization': `Bearer ${token}` };

        if (hasRole('admin')) {
          const res = await fetch('/api/transfer', { headers });
          const data = await res.json();
          setTransfers(Array.isArray(data) ? data : []);
        } else if (hasRole('manager')) {
          const prisonId = localStorage.getItem('prison_id') || '';
          const res = await fetch(`/api/transfer/prison/${prisonId}`, { headers });
          const data = await res.json();
          setTransfers(Array.isArray(data) ? data : []);
        } else {
          setTransfers([]);
        }
      } catch (err) {
        console.error('Error fetching transfers:', err);
        setTransfers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Transfer Requests...</div>;

  const handleTransferAction = async (transferId, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Denied';
      const approval_date = new Date().toISOString().split('T')[0];
      const endpoint = action === 'approve'
        ? `/api/transfer/${transferId}/accept`
        : `/api/transfer/${transferId}/reject`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved_by: Number(localStorage.getItem('userNationalId') || 0),
          approval_date
        })
      });

      if (!response.ok) throw new Error('Action failed');

      setTransfers((current) =>
        current.map((transfer) =>
          transfer.transfer_id === transferId
            ? { ...transfer, status, approval_date }
            : transfer
        )
      );
    } catch (err) {
      console.error('Failed to update transfer', err);
    }
  };

  return (
    <div className={styles.prisonContainer}>
      <div className={styles.wallBackground} aria-hidden="true">
        <div className={styles.wallGrain} />
        <div className={styles.blockLines} />
        <div className={styles.stainOne} />
        <div className={styles.stainTwo} />
        <div className={styles.lightTube} />
        <div className={styles.lightCone} />
      </div>
      <div className={styles.flickerLight} aria-hidden="true" />
      <div className={styles.barOverlay} aria-hidden="true">
        {[0, 1, 2].map((bar) => <div key={bar} className={styles.bar} />)}
      </div>

      <div className={styles.prisonContent}>
        <header className={styles.prisonHeader}>
          <h1 className={styles.prisonTitle}>Transfer Requests</h1>
        </header>

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Inmate Transfers</div>
          <div className={styles.tableWrapper}>
            <table className={styles.table} style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '19%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                {hasRole('admin') && <col style={{ width: '13%' }} />}
              </colgroup>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Inmate</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  {hasRole('admin') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transfers.length > 0 ? transfers.map((t) => (
                  <tr key={t.transfer_id}>
                    <td style={{ verticalAlign: 'middle' }}>{t.transfer_id}</td>
                    <td style={{ verticalAlign: 'middle', wordBreak: 'break-word' }}>{t.inmate_name}</td>
                    <td style={{ verticalAlign: 'middle', wordBreak: 'break-word' }}>{t.from_prison}</td>
                    <td style={{ verticalAlign: 'middle', wordBreak: 'break-word' }}>{t.to_prison}</td>
                    <td style={{ verticalAlign: 'middle', wordBreak: 'break-word', fontSize: '0.85rem' }}>{t.reason || '—'}</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <span className={`${styles.badge} ${t.status === 'Approved' ? styles.badgeSuccess :
                        t.status === 'Denied' ? styles.badgeDanger :
                          styles.badgeWarning
                        }`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: '#7a6a58', wordBreak: 'break-word' }}>
                      {t.approval_date ? t.approval_date : (t.requested_at ? t.requested_at.split('T')[0] : '—')}
                    </td>
                    {hasRole('admin') && (
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {t.status === 'Pending' ? (
                            <>
                              <button
                                className={`${styles.btn} ${styles.badgeSuccess}`}
                                style={{ padding: '6px 10px', fontSize: '0.8rem', border: 'none' }}
                                onClick={() => handleTransferAction(t.transfer_id, 'approve')}
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                className={`${styles.btn} ${styles.badgeDanger}`}
                                style={{ padding: '6px 10px', fontSize: '0.8rem', border: 'none' }}
                                onClick={() => handleTransferAction(t.transfer_id, 'deny')}
                              >
                                <X size={13} /> Deny
                              </button>
                            </>
                          ) : (
                            <span style={{ color: '#7a6a58' }}>—</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td
                      colSpan={hasRole('admin') ? '8' : '7'}
                      className={styles.emptyState}
                    >
                      No transfer requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasRole('manager') && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/transfers/add" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Request Transfer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};