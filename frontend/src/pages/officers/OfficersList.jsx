import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';

export const OfficersList = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const headers = { 'Authorization': `Bearer ${token}` };

        if (hasRole('admin')) {
          const res = await fetch('/api/staff', { headers });
          const data = await res.json();
          setOfficers(Array.isArray(data) ? data : []);
        } else if (hasRole('manager')) {
          const prisonId = localStorage.getItem('prison_id') || '';
          const res = await fetch(`/api/staff/prison/${prisonId}`, { headers });
          const data = await res.json();
          setOfficers(Array.isArray(data) ? data : []);
        } else {
          setOfficers([]);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
        setOfficers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading Staff Records...</div>;

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
          <h1 className={styles.prisonTitle}>Staff Management</h1>
        </header>

        {hasRole('admin') && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/officers/add" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Add Staff
            </Link>
          </div>
        )}

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Registered Staff</div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>National ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Prison</th>
                </tr>
              </thead>
              <tbody>
                {officers.length > 0 ? officers.map((o) => (
                  <tr key={o.national_id}>
                    <td>{o.national_id}</td>
                    <td><strong>{o.name}</strong></td>
                    <td>
                      <span className={`${styles.badge} ${o.role === 'manager' ? styles.badgeInfo : styles.badgeSuccess}`}>
                        {o.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td>{o.email || '—'}</td>
                    <td>{o.phone || '—'}</td>
                    <td>{o.prison_name || 'Unassigned'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className={styles.emptyState}>No staff registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
