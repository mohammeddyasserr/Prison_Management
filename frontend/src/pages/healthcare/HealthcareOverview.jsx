import React, { useEffect, useState } from 'react';
import { Plus, Activity, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../services/authentication';

export const HealthcareOverview = () => {
  const [data, setData] = useState({ doctors: [], visits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/doctor').then(r => r.json()),
      fetch('/api/medical_visit').then(r => r.json()),
    ]).then(([doctors, visits]) => {
      setData({ doctors, visits });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Healthcare Records...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Healthcare</h1>
        <div className={styles.actions}>
          {hasRole('admin', 'prison_manager') && (
            <>
              <Link to="/healthcare/doctors/add" className={`${styles.btn} ${styles.btnPrimary}`}>
                <Plus size={16} /> Add Doctor
              </Link>
              <Link to="/healthcare/visits/add" className={`${styles.btn}`} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                <Plus size={16} /> Record Medical Visit
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeartPulse size={20} color="var(--color-danger)" /> Doctors
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>National ID</th><th>Name</th><th>Address</th><th>Phone</th><th>Prison</th></tr></thead>
            <tbody>
              {data.doctors.length > 0 ? data.doctors.map((doc) => (
                <tr key={doc.national_id}>
                  <td>{doc.national_id}</td>
                  <td>{doc.name}</td>
                  <td>{doc.address || '—'}</td>
                  <td>{doc.phone || '—'}</td>
                  <td>{doc.prison_name}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No doctors registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--color-primary)" /> Medical Visit Records
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Inmate</th><th>Doctor</th><th>Date/Time</th><th>Diagnosis</th><th>Notes</th></tr></thead>
            <tbody>
              {data.visits.length > 0 ? data.visits.map((v) => (
                <tr key={v.visit_id}>
                  <td>{v.visit_id}</td>
                  <td>{v.inmate_name}</td>
                  <td>{v.doctor_name}</td>
                  <td>{v.date_time}</td>
                  <td>{v.diagnosis || '—'}</td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '300px' }}>{v.description || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No medical visits recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
