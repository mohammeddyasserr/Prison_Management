import React, { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../services/authentication';

export const TransfersList = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transfer')
      .then(r => r.json())
      .then(data => { setTransfers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Transfer Requests...</div>;

  const handleTransferAction = (transferId, action) => {
    setTransfers((current) =>
      current.map((transfer) =>
        transfer.transfer_id === transferId
          ? { ...transfer, status: action === 'approve' ? 'Approved' : 'Denied' }
          : transfer
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transfer Requests</h1>
        {hasRole('prison_manager') && (
          <Link to="/transfers/add" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Request Transfer
          </Link>
        )}
      </div>

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
                <td style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  {t.approval_date || '—'}
                </td>
                {hasRole('admin') && (
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {t.status === 'Pending' ? (
                        <>
                          <button
                            className={`${styles.btn} ${styles.badgeSuccess}`}
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleTransferAction(t.transfer_id, 'approve')}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            className={`${styles.btn} ${styles.badgeDanger}`}
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleTransferAction(t.transfer_id, 'deny')}
                          >
                            <X size={13} /> Deny
                          </button>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>—</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td
                  colSpan={hasRole('admin') ? '8' : '7'}
                  style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}
                >
                  No transfer requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};