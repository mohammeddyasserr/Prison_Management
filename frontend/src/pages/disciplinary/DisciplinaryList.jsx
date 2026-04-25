import React, { useEffect, useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { getDisciplinaryLogs, getInmates, getOfficers } from '../../data/mockData';

export const DisciplinaryList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logs = getDisciplinaryLogs();
    const inmates = getInmates();
    const officers = getOfficers();
    const enriched = logs.map(log => ({
      ...log,
      inmate_name: inmates.find(i => i.inmate_id === log.inmate_id)?.full_name || '—',
      imposed_by_name: officers.find(o => o.national_id === log.imposed_by)?.name || '—',
    }));
    setLogs(enriched);
    setLoading(false);
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Disciplinary Logs...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Disciplinary Logs</h1>
        <Link to="/disciplinary/add" className={`${styles.btn} ${styles.btnPrimary}`}>
          <Plus size={16} /> Add Record
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <Info size={16} color="var(--color-primary)" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          Mandatory registry per PRD 6.2. Records cannot be deleted.
        </p>
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
                <td style={{ fontSize: '0.8rem', maxWidth: '200px' }}>{log.notes || '—'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  No disciplinary records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};