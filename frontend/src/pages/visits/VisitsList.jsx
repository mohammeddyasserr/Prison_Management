import React, { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../services/authentication';
import { postForm } from '../../services/authentication';

export const VisitsList = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/visit')
      .then(r => r.json())
      .then(data => { setVisits(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Visit Requests...</div>;

  const handleVisitAction = async (visitId, action) => {
    await postForm(`/visits/${visitId}/${action}`, action === 'deny' ? { denial_reason: '' } : {});
    setVisits((current) =>
      current.map((visit) =>
        visit.visit_id === visitId
          ? { ...visit, status: action === 'approve' ? 'Approved' : 'Denied' }
          : visit
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Visit Management</h1>
        <div className={styles.actions}>
          {hasRole('manager') && (
            <Link to="/visits/slots" className={`${styles.btn} ${styles.btnOutline}`}>
              <Clock size={16} /> Manage Slots
            </Link>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Visitor</th>
              <th>Inmate NID</th>
              <th>Relationship</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              {hasRole('manager') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visits.length > 0 ? visits.map((v) => (
              <tr key={v.visit_id}>
                <td>{v.visit_id}</td>
                <td>{v.visitor_name || '—'}</td>
                <td>{v.inmate_national_id}</td>
                <td>{v.relationship || '—'}</td>
                <td>{v.visit_date}</td>
                <td>{v.time_slot || '—'}</td>
                <td>
                  <span className={`${styles.badge} ${v.visit_type === 'Legal' ? styles.badgeInfo : styles.badgeSuccess}`}>
                    {v.visit_type}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${v.status === 'Approved' ? styles.badgeSuccess : v.status === 'Denied' ? styles.badgeDanger : styles.badgeWarning}`}>
                    {v.status}
                  </span>
                  {v.denial_reason && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{v.denial_reason}</div>}
                </td>
                {hasRole('manager') && (
                  <td className={styles.actions}>
                    {v.status === 'Pending' ? (
                      <>
                        <button
                          className={`${styles.btn} ${styles.badgeSuccess}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                          onClick={() => handleVisitAction(v.visit_id, 'approve')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className={`${styles.btn} ${styles.badgeDanger}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                          onClick={() => handleVisitAction(v.visit_id, 'deny')}
                        >
                          <X size={14} /> Deny
                        </button>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            )) : (
              <tr><td colSpan={hasRole('manager') ? '9' : '8'} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No visit requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
