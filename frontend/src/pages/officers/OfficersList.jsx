import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../lib/auth';
import { getOfficers, getPrisons } from '../../data/mockData';

export const OfficersList = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const officers = getOfficers();
    const prisons = getPrisons();
    const enriched = officers.map(o => ({
      ...o,
      prison_name: prisons.find(p => p.prison_id === o.prison_id)?.name || null
    }));
    setOfficers(enriched);
    setLoading(false);
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Staff Records...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Staff Management</h1>
        {hasRole('super_admin') && (
          <Link to="/officers/add" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Add Staff
          </Link>
        )}
      </div>

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
                  <span className={`${styles.badge} ${o.role === 'prison_manager' ? styles.badgeInfo : styles.badgeSuccess}`}>
                    {o.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>
                <td>{o.email || '—'}</td>
                <td>{o.phone || '—'}</td>
                <td>{o.prison_name || 'Unassigned'}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
