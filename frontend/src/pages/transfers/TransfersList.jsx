import React, { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../lib/auth';
import { postForm } from '../../lib/http';

export const TransfersList = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/transfers/api/list');
        const result = await response.json();
        setTransfers(result.transfers || []);
      } catch (error) {
        console.error("Failed to fetch transfers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Transfer Requests...</div>;

  const handleTransferAction = async (transferId, action) => {
    await postForm(`/transfers/${transferId}/${action}`, {});
    setTransfers((current) =>
      current.map((transfer) =>
        transfer.transfer_id === transferId
          ? {
              ...transfer,
              status: action === 'approve' ? 'Approved' : 'Denied',
            }
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Inmate</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              {hasRole('super_admin') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {transfers.length > 0 ? transfers.map((t) => (
              <tr key={t.transfer_id}>
                <td>{t.transfer_id}</td>
                <td>{t.inmate_name}</td>
                <td>{t.from_prison}</td>
                <td>{t.to_prison}</td>
                <td style={{fontSize: '0.8rem', maxWidth: '200px'}}>{t.reason || '—'}</td>
                <td>
                  <span className={`${styles.badge} ${t.status === 'Approved' ? styles.badgeSuccess : t.status === 'Denied' ? styles.badgeDanger : styles.badgeWarning}`}>
                    {t.status}
                  </span>
                  {t.approval_date && <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px'}}>{t.approval_date}</div>}
                </td>
                {hasRole('super_admin') && (
                  <td className={styles.actions}>
                    {t.status === 'Pending' ? (
                      <>
                        <button
                          className={`${styles.btn} ${styles.badgeSuccess}`}
                          style={{border: 'none', cursor: 'pointer'}}
                          onClick={() => handleTransferAction(t.transfer_id, 'approve')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className={`${styles.btn} ${styles.badgeDanger}`}
                          style={{border: 'none', cursor: 'pointer'}}
                          onClick={() => handleTransferAction(t.transfer_id, 'deny')}
                        >
                          <X size={14} /> Deny
                        </button>
                      </>
                    ) : (
                      <span style={{color: 'var(--text-muted)'}}>—</span>
                    )}
                  </td>
                )}
              </tr>
            )) : (
              <tr><td colSpan={hasRole('super_admin') ? '7' : '6'} style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No transfer requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
