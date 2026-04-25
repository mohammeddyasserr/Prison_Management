import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Info, User, Shield, ArrowLeft } from 'lucide-react';
import styles from '../EntityStyles.module.css';
import { getIncidentDetail, getDisciplinaryLogs, getInmates, getOfficers } from '../../data/mockData';

export const IncidentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const result = getIncidentDetail(id);
    if (!result) { setLoading(false); return; }

    const disciplinary = getDisciplinaryLogs().filter(dl => dl.incident_id === parseInt(id));
    const inmates = getInmates();
    const officers = getOfficers();

    const involved_inmates = disciplinary.map(dl => inmates.find(i => i.inmate_id === dl.inmate_id)).filter(Boolean);
    const involved_staff = officers.filter(o => o.national_id === result.incident.reporting_officer);

    setData({ ...result, involved_inmates, involved_staff, disciplinary });
    setLoading(false);
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Incident Report...</div>;
  if (!data || data.error) return <div style={{ padding: '40px', textAlign: 'center' }}>Incident not found.</div>;

  const { incident, involved_inmates, involved_staff } = data;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Incident Report #{incident.incident_id}</h1>
        <Link to="/incidents" className={`${styles.btn} ${styles.btnOutline}`}>
          <ArrowLeft size={16} /> Back to Incidents
        </Link>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={20} color="var(--color-primary)" /> Incident Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Type:</span><br />
            <span className={`${styles.badge} ${styles.badgeDanger}`}>{incident.type}</span>
          </div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Date/Time:</span><br />{incident.date_time}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Prison:</span><br />{incident.prison_name || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Block:</span><br />{incident.block_name || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Cell:</span><br />{incident.cell_id ? `#${incident.cell_id}` : '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reporting Officer:</span><br />{incident.officer_name || '—'}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Description</h2>
        <p style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>{incident.description || 'No description provided.'}</p>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Action Taken</h2>
        <p style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>{incident.action_taken || 'No action documented.'}</p>
      </div>

      {involved_inmates.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--color-warning)" /> Inmates Involved
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Name</th><th>Action</th></tr></thead>
              <tbody>
                {involved_inmates.map((i) => (
                  <tr key={i.inmate_id}>
                    <td>{i.inmate_id}</td>
                    <td>{i.full_name}</td>
                    <td>
                      <Link to={`/inmates/${i.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {involved_staff.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--color-primary)" /> Staff Involved
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Name</th><th>Role</th></tr></thead>
              <tbody>
                {involved_staff.map((s) => (
                  <tr key={s.national_id}>
                    <td>{s.national_id}</td>
                    <td>{s.name}</td>
                    <td>{s.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
  {
    data.disciplinary?.length > 0 && (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="var(--color-danger)" /> Related Disciplinary Actions
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Inmate</th><th>Punishment</th><th>Duration</th><th>Date</th><th>Notes</th></tr></thead>
            <tbody>
              {data.disciplinary.map((d, i) => {
                const inmate = getInmates().find(in_ => in_.inmate_id === d.inmate_id);
                return (
                  <tr key={i}>
                    <td>{inmate?.full_name || '—'}</td>
                    <td>{d.punishment_type}</td>
                    <td>{d.solitary_confinement_duration ? `${d.solitary_confinement_duration} days` : '—'}</td>
                    <td>{d.date_imposed}</td>
                    <td style={{ fontSize: '0.8rem' }}>{d.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
};
