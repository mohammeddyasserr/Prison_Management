import React, { useEffect, useState } from 'react';
import { Plus, Eye, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../services/authentication';
import { getInmates, getPrisons } from '../../data/mockData';

export const InmatesList = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inmates = getInmates();
    const prisons = getPrisons();
    const enriched = inmates.map(i => ({
      ...i,
      prison_name: prisons.find(p => p.prison_id === i.assigned_prison)?.name || null
    }));
    setInmates(enriched);
    setLoading(false);
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Inmate Records...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inmate Records</h1>
        {hasRole('super_admin') && (
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
                <td>{inmate.prison_name || 'Unassigned'}</td>
                <td>{inmate.start_date || '—'}</td>
                <td>{inmate.expected_release_date || '—'}</td>
                <td className={styles.actions}>
                  <Link to={`/inmates/${inmate.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                    <Eye size={14} /> View
                  </Link>
                  {hasRole('prison_manager') && !inmate.assigned_cell && (
                    <Link to={`/inmates/${inmate.inmate_id}/assign`} className={`${styles.btn}`} style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}>
                      <UserPlus size={14} /> Assign Cell
                    </Link>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No inmates found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
