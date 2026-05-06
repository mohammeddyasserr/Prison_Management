import React, { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/incidents')
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
                  <th>Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length > 0 ? incidents.map((inc) => (
                  <tr key={inc.incident_id}>
                    <td>{inc.incident_id}</td>
                    <td><span className={`${styles.badge} ${styles.badgeDanger}`}>{inc.type}</span></td>
                    <td>{inc.date_time}</td>
                    <td>{inc.prison_name || '—'}</td>
                    <td>{inc.block_name || '—'}</td>
                    <td>{inc.officer_name || '—'}</td>
                    <td>
                      <Link to={`/incidents/${inc.incident_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className={styles.emptyState}>No incidents reported.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasRole('officer') && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/incidents/add" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Report Incident
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
