import React, { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const VisitsList = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, visitId: null, reason: '' });

  useEffect(() => {
    const token = localStorage.getItem('userToken') || '';
    const headers = { 'Authorization': `Bearer ${token}` };
    const prisonId = localStorage.getItem('prison_id');

    const url = prisonId ? `/api/visit?prison_id=${prisonId}` : '/api/visit';
    fetch(url, { headers })
      .then(r => r.json())
      .then(data => { setVisits(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Visit Requests...</div>;

  const handleVisitAction = async (visitId, action) => {
    if (action === 'reject') {
      setRejectModal({ open: true, visitId, reason: '' });
      return;
    }

    try {
      await fetch(`/api/visit/${visitId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({})
      });
      setVisits((current) =>
        current.map((visit) =>
          visit.visit_id === visitId
            ? { ...visit, status: 'Approved', denial_reason: visit.denial_reason }
            : visit
        )
      );
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const submitReject = async () => {
    if (!rejectModal.reason.trim()) return;
    try {
      await fetch(`/api/visit/${rejectModal.visitId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ denial_reason: rejectModal.reason })
      });
      setVisits((current) =>
        current.map((visit) =>
          visit.visit_id === rejectModal.visitId
            ? { ...visit, status: 'Denied', denial_reason: rejectModal.reason }
            : visit
        )
      );
    } catch (error) {
      console.error("Action failed:", error);
    }
    setRejectModal({ open: false, visitId: null, reason: '' });
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

       {rejectModal.open && (
         <div style={{
           position: 'fixed', inset: 0, zIndex: 1000,
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
         }}>
           <div className={styles.formCard} style={{ width: '420px', maxWidth: '90%', position: 'relative' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ margin: 0, color: '#7a0000', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08rem' }}>
                 Deny Visit Request
               </h3>
               <button
                 onClick={() => setRejectModal({ open: false, visitId: null, reason: '' })}
                 style={{ background: 'none', border: 'none', color: '#7a6a58', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
               >×</button>
             </div>
             <p style={{ color: '#6a5742', fontSize: '0.82rem', marginBottom: '12px' }}>
               Please provide a reason for denying this visit request.
             </p>
             <textarea
               value={rejectModal.reason}
               onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
               rows={4}
               placeholder="Enter denial reason..."
               className={styles.formTextarea}
               style={{ marginBottom: '16px' }}
               autoFocus
             />
             <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setRejectModal({ open: false, visitId: null, reason: '' })}
                 className={`${styles.btn} ${styles.btnOutline}`}
               >Cancel</button>
               <button
                 onClick={submitReject}
                 disabled={!rejectModal.reason.trim()}
                 className={`${styles.btn} ${styles.btnPrimary}`}
                 style={{ opacity: rejectModal.reason.trim() ? 1 : 0.5 }}
               >Submit Denial</button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
};
