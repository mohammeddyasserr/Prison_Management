import React, { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const VisitsList = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/visit')
      .then(r => r.json())
      .then(data => { setVisits(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Visit Requests...</div>;

  const handleVisitAction = async (visitId, action) => {
    let denial_reason = '';
    if (action === 'reject') {
      denial_reason = window.prompt("Please enter the reason for denial:");
      if (denial_reason === null) return;
    }

    try {
      await fetch(`/api/visit/${visitId}/${action === 'reject' ? 'reject' : 'confirm'}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(action === 'reject' ? { denial_reason } : {})
      });
      setVisits((current) =>
        current.map((visit) =>
          visit.visit_id === visitId
            ? { ...visit, status: action === 'confirm' ? 'Approved' : 'Denied', denial_reason: action === 'reject' ? denial_reason : visit.denial_reason }
            : visit
        )
      );
    } catch (error) {
      console.error("Action failed:", error);
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
           <h1 className={styles.prisonTitle}>Visit Management</h1>
         </header>

         {hasRole('admin') && (
           <div style={{ textAlign: 'right', marginBottom: '20px' }}>
             <Link to="/visits/slots" className={`${styles.btn} ${styles.btnPrimary}`}>
               <Clock size={16} /> Manage Slots
             </Link>
           </div>
         )}

         <div className={styles.ledger}>
           <div className={styles.ledgerTitle}>Visit Requests</div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Visitor</th>
                  <th>Inmate Name</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Denial Reason</th>
                  {hasRole('manager') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visits.length > 0 ? visits.map((v) => (
                  <tr key={v.visit_id}>
                    <td>{v.visit_id}</td>
                    <td>{v.visitor_name || '—'}</td>
                    <td>{v.inmate_name || '—'}</td>
                    <td>{v.visit_date}</td>
                    <td>
                      <span className={`${styles.badge} ${v.visit_type === 'Legal' ? styles.badgeInfo : styles.badgeSuccess}`}>
                        {v.visit_type}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${v.status === 'Approved' ? styles.badgeSuccess : v.status === 'Denied' ? styles.badgeDanger : styles.badgeWarning}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>{v.denial_reason || '—'}</td>
                    {hasRole('manager') && (
                      <td className={styles.actions}>
                        {v.status === 'Pending' ? (
                          <>
                            <button
                              className={`${styles.btn} ${styles.badgeSuccess}`}
                              style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleVisitAction(v.visit_id, 'confirm')}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className={`${styles.btn} ${styles.badgeDanger}`}
                              style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleVisitAction(v.visit_id, 'reject')}
                            >
                              <X size={14} /> Deny
                            </button>
                          </>
                        ) : (
                          <span style={{ color: '#7a6a58' }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan={hasRole('manager') ? '8' : '7'} className={styles.emptyState}>No visit requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
