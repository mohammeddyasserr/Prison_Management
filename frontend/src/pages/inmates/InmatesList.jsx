import React, { useEffect, useState } from 'react';
import { Plus, Eye, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../services/authentication';

export const InmatesList = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inmates')
      .then(r => r.json())
      .then(data => { setInmates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Inmate Records...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inmate Records</h1>
        {hasRole('admin') && (
          <Link to="/inmates/add" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Admit New Inmate
          </Link>
        )}
      </div>

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
                    <Link to={`/inmates/${inmate.inmate_id}/assign`} className={`${styles.btn}`} style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}>
                      <UserPlus size={14} /> Assign Cell
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
  );
};
