import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const DisciplinaryList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken') || '';
    const headers = { 'Authorization': `Bearer ${token}` };
    const prisonId = localStorage.getItem('prison_id');
    const url = prisonId ? `/api/disciplinary?prison_id=${prisonId}` : '/api/disciplinary';
    fetch(url, { headers })
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Disciplinary Records...</div>;

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
          <h1 className={styles.prisonTitle}>Disciplinary Records</h1>
        </header>

        {hasRole('officer') && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/disciplinary/add" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Add Record
            </Link>
          </div>
        )}

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Disciplinary Records</div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Inmate</th>
                  <th>Incident</th>
                  <th>Punishment</th>
                  <th>Solitary (days)</th>
                  <th>Date</th>
                  <th>End Date</th>
                  <th>Imposed By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map((log, idx) => (
                  <tr key={log.log_id ?? idx}>
                    <td>{log.inmate_name}</td>
                    <td>
                      {log.incident_id ? (
                        <Link to={`/incidents/${log.incident_id}`} className={`${styles.btn} ${styles.btnOutline}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                          #{log.incident_id}
                        </Link>
                      ) : '—'}
                    </td>
                    <td>{log.punishment_type}</td>
                    <td>{log.solitary_days || '—'}</td>
                    <td>{log.date_imposed}</td>
                    <td>{log.end_date || '—'}</td>
                    <td>{log.imposed_by_name || log.officer_name || '—'}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '200px' }}>{log.notes || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className={styles.emptyState}>No disciplinary records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
