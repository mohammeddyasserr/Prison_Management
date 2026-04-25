import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../lib/auth';

export const PrisonsList = () => {
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/prisons/api/list');
        const result = await response.json();
        setPrisons(result.prisons || []);
      } catch (error) {
        console.error("Failed to fetch prisons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Prisons...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prison Facilities</h1>
        {hasRole('super_admin') && (
          <Link to="/prisons/add" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Add Prison
          </Link>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Security</th>
              <th>Occupancy</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prisons.length > 0 ? prisons.map((prison) => {
              const rate = prison.total_capacity > 0 ? (prison.current_occupancy * 100 / prison.total_capacity) : 0;
              let badgeClass = styles.badgeSuccess;
              if (rate > 90) badgeClass = styles.badgeDanger;
              else if (rate >= 75) badgeClass = styles.badgeWarning;

              return (
                <tr key={prison.prison_id}>
                  <td>{prison.prison_id}</td>
                  <td><strong>{prison.name}</strong></td>
                  <td>{prison.location}</td>
                  <td>{prison.type}</td>
                  <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{prison.security_level}</span></td>
                  <td>
                    {prison.current_occupancy}/{prison.total_capacity}
                    <span className={`${styles.badge} ${badgeClass}`} style={{marginLeft: '8px'}}>
                      {rate.toFixed(1)}%
                    </span>
                  </td>
                  <td>{prison.manager_name || '—'}</td>
                  <td className={styles.actions}>
                    <Link to={`/prisons/${prison.prison_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                      <Eye size={14} /> View
                    </Link>
                    {hasRole('super_admin') && (
                      <Link to={`/prisons/${prison.prison_id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
                        <Edit size={14} /> Edit
                      </Link>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No prisons found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
