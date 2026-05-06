import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const PrisonsList = () => {
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrisons = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const headers = { 'Authorization': `Bearer ${token}` };
        if (hasRole('admin')) {
          const res = await fetch('/api/prison', { headers });
          const data = await res.json();
          setPrisons(Array.isArray(data) ? data : [data]);
        } else {
          // For managers/officers, fetch all prisons and filter by manager_id
          const res = await fetch('/api/prison', { headers });
          const data = await res.json();
          const allPrisons = Array.isArray(data) ? data : [data];
          const nationalId = localStorage.getItem('userNationalId') || '';
          const myPrison = allPrisons.filter(
            p => p.manager_id === nationalId || p.manager_name
          );
          // If manager has a prison assigned via manager_id
          const managerPrison = allPrisons.find(p => p.manager_id === nationalId);
          if (managerPrison) {
            setPrisons([managerPrison]);
          } else {
            // Show all prisons the user might be associated with
            setPrisons(myPrison.length > 0 ? myPrison : allPrisons);
          }
        }
      } catch (err) {
        console.error('Error fetching prisons:', err);
        setPrisons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrisons();
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Prisons...</div>;

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
          <h1 className={styles.prisonTitle}>Prison Facilities</h1>
        </header>

        {hasRole('admin') && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/prisons/add" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Add Prison
            </Link>
          </div>
        )}

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Registered Facilities</div>
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
                        <span className={`${styles.badge} ${badgeClass}`} style={{ marginLeft: '8px' }}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                      <td>{prison.manager_name || '—'}</td>
                      <td className={styles.actions}>
                        <Link to={`/prisons/${prison.prison_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                          <Eye size={14} /> View
                        </Link>
                        {hasRole('admin') && (
                          <Link to={`/prisons/${prison.prison_id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
                            <Edit size={14} /> Edit
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="8" className={styles.emptyState}>No prisons registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
