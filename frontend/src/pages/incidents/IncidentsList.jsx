import React, { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken') || '';
    const headers = { 'Authorization': `Bearer ${token}` };
    const prisonId = localStorage.getItem('prison_id');

    const url = prisonId ? `/api/incidents/prison/${prisonId}` : '/api/incidents';
    fetch(url, { headers })
      .then(r => r.json())
      .then(data => { setIncidents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Incident Reports...</div>;

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
          <h1 className={styles.prisonTitle}>Incident Reports</h1>
        </header>

         {hasRole('officer') && (
           <div style={{ textAlign: 'right', marginBottom: '20px' }}>
             <Link to="/incidents/add" className={`${styles.btn} ${styles.btnPrimary}`}>
               <Plus size={16} /> Report Incident
             </Link>
           </div>
         )}

         <div className={styles.ledger}>
           <div className={styles.ledgerTitle}>Security Incidents</div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
               <thead>
                 <tr>
                   <th>ID</th>
                   <th>Type</th>
                   <th>Date/Time</th>
                   <th>Prison</th>
                   <th>Block</th>
                   <th>Inmates Involved</th>
                   <th>Officer</th>
                   <th>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {incidents.length > 0 ? incidents.map((inc) => (
                   <tr key={inc.incident_id}>
                     <td>{inc.incident_id}</td>
                     <td><span className={`${styles.badge} ${styles.badgeDanger}`}>{inc.type}</span></td>
                     <td>{new Date(inc.occurred_at).toLocaleString()}</td>
                     <td>{inc.prison_name || '—'}</td>
                     <td>{inc.block_id || '—'}</td>
                     <td style={{ maxWidth: '180px', fontSize: '0.82rem' }}>{inc.involved_inmate_names || '—'}</td>
                     <td>{inc.officer_name || '—'}</td>
                     <td>
                       <Link to={`/incidents/${inc.incident_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                         <Eye size={14} /> View
                       </Link>
                     </td>
                   </tr>
                 )) : (
                   <tr><td colSpan="8" className={styles.emptyState}>No incidents reported.</td></tr>
                 )}
              </tbody>
            </table>
          </div>
         </div>
      </div>
    </div>
  );
};