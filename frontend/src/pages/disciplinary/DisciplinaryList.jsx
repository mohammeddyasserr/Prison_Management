import React, { useEffect, useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';

export const DisciplinaryList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/disciplinary')
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Disciplinary Logs...</div>;

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
          <h1 className={styles.prisonTitle}>Disciplinary Logs</h1>
          <Link to="/disciplinary/add" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Add Record
          </Link>
        </header>

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Mandatory Registry - PRD 6.2</div>
          <div style={{ padding: '12px', background: 'rgba(122, 0, 0, 0.08)', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#7a0000' }}>
            <Info size={16} />
            <span>Records cannot be deleted per PRD 6.2 regulations.</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Incident</th>
                  <th>Inmate</th>
                  <th>Punishment</th>
                  <th>Solitary (days)</th>
                  <th>Date</th>
                  <th>End Date</th>
                  <th>Imposed By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log.log_id}>
                    <td>{log.log_id}</td>
                    <td>
                      {log.incident_id
                        ? <Link to={`/incidents/${log.incident_id}`} className={`${styles.btn} ${styles.btnOutline}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            #{log.incident_id}
                          </Link>
                        : '—'}
                    </td>
                    <td>{log.inmate_name}</td>
                    <td>{log.punishment_type}</td>
                    <td>{log.solitary_confinement_duration || '—'}</td>
                    <td>{log.date_imposed}</td>
                    <td>{log.end_date || '—'}</td>
                    <td>{log.imposed_by_name || '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{log.notes || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" className={styles.emptyState}>No disciplinary records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};