import React, { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../lib/auth';

export const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/incidents/api/list');
        const result = await response.json();
        setIncidents(result.incidents || []);
      } catch (error) {
        console.error("Failed to fetch incidents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Incident Reports...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Incident Reports</h1>
        {hasRole('officer', 'prison_manager') && (
          <Link to="/incidents/add" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Report Incident
          </Link>
        )}
      </div>

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
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No incidents reported.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
