import React, { useEffect, useState } from 'react';
import { Plus, Eye, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const InmatesList = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInmates = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const headers = { 'Authorization': `Bearer ${token}` };

        if (hasRole('admin')) {
          const res = await fetch('/api/inmates', { headers });
          const data = await res.json();
          setInmates(Array.isArray(data) ? data : []);
        } else if (hasRole('manager')) {
          const nationalId = localStorage.getItem('userNationalId') || '';
          const res = await fetch(`/api/inmates/manager/${nationalId}`, { headers });
          const data = await res.json();
          setInmates(Array.isArray(data) ? data : []);
        } else {
          // officer or other roles — use prison_id stored in localStorage
          const storedPrisonId = localStorage.getItem('prison_id');
          if (storedPrisonId) {
            const res = await fetch(`/api/inmates/prison/${storedPrisonId}`, { headers });
            const data = await res.json();
            setInmates(Array.isArray(data) ? data : []);
          } else {
            setInmates([]);
          }
        }
      } catch (err) {
        console.error('Error fetching inmates:', err);
        setInmates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInmates();
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Inmate Records...</div>;

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
          <h1 className={styles.prisonTitle}>Inmate Records</h1>
        </header>

        {hasRole('admin') && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/inmates/add" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Admit New Inmate
            </Link>
          </div>
        )}

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Registered Inmates</div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>National ID</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Prison</th>
                  <th>Start Date</th>
                  <th>Release Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inmates.length > 0 ? inmates.map((inmate) => (
                  <tr key={inmate.inmate_id}>
                    <td>{inmate.inmate_id}</td>
                    <td><strong>{inmate.full_name}</strong></td>
                    <td>{inmate.national_id || '—'}</td>
                    <td>{inmate.gender}</td>
                    <td>
                      <span className={`${styles.badge} ${inmate.status === 'Active' ? styles.badgeSuccess : inmate.status === 'Pending' ? styles.badgeWarning : styles.badgeInfo}`}>
                        {inmate.status}
                      </span>
                    </td>
                    <td>{inmate.prison_name || 'Unassigned'}</td>
                    <td>{inmate.start_date || '—'}</td>
                    <td>{inmate.release_date || '—'}</td>
                    <td className={styles.actions}>
                      <Link to={`/inmates/${inmate.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                        <Eye size={14} /> View
                      </Link>
                      {hasRole('manager') && inmate.status === 'Active' && !inmate.assigned_cell && (
                        <Link to={`/inmates/${inmate.inmate_id}/assign`} className={`${styles.btn} ${styles.badgeWarning}`} style={{ textDecoration: 'none' }}>
                          <UserPlus size={14} /> Assign
                        </Link>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No inmates found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
