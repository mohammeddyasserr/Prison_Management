import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Scale, AlertTriangle, ShieldAlert, HeartPulse, LogOut } from 'lucide-react';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../lib/auth';
import { postForm } from '../../lib/http';
import { getInmateDetail, getPrisons, getBlocks, getDoctors } from '../../data/mockData';

export const InmateDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const result = getInmateDetail(id);
    if (result) {
      const prisons = getPrisons();
      const blocks = getBlocks();
      const doctors = getDoctors();
      result.inmate.prison_name = prisons.find(p => p.prison_id === result.inmate.assigned_prison)?.name || null;
      result.inmate.block_name = blocks.find(b => b.block_id === result.inmate.assigned_block)?.name || null;
      result.medical = result.medical.map(m => ({
        ...m,
        doctor_name: doctors.find(d => d.national_id === m.doctor_id)?.name || '—'
      }));
    }
    setData(result);
    setLoading(false);
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Inmate Profile...</div>;
  if (!data || data.error) return <div style={{ padding: '40px', textAlign: 'center' }}>Inmate not found.</div>;

  const { inmate, legal_case, incidents, disciplinary, medical } = data;

  const releaseInmate = async () => {
    if (!window.confirm('Release this inmate?')) return;
    await postForm(`/inmates/${id}/release`, {});
    window.location.href = '/inmates';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inmate Profile — {inmate.full_name}</h1>
        <div className={styles.actions}>
          {hasRole('prison_manager') && !inmate.assigned_cell && (
            <Link to={`/inmates/${id}/assign`} className={`${styles.btn} ${styles.badgeWarning}`} style={{ color: 'white' }}>
              Assign to Cell
            </Link>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="var(--color-primary)" /> Personal Information
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Inmate ID:</span><br />{inmate.inmate_id}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>National ID:</span><br />{inmate.national_id || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Date of Birth:</span><br />{inmate.date_of_birth || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Gender:</span><br />{inmate.gender}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Nationality:</span><br />{inmate.nationality || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Occupation:</span><br />{inmate.occupation || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Start Date:</span><br />{inmate.start_date || '—'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Status:</span><br />
            <span className={`${styles.badge} ${inmate.status === 'active' ? styles.badgeSuccess : inmate.status === 'released' ? styles.badgeInfo : styles.badgeWarning}`}>
              {inmate.status}
            </span>
          </div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Prison:</span><br />{inmate.prison_name || 'Unassigned'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Block:</span><br />{inmate.block_name || 'Unassigned'}</div>
          <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Cell:</span><br />{inmate.assigned_cell ? `Cell #${inmate.assigned_cell}` : 'Unassigned'}</div>
        </div>
      </div>

      {/* Legal Case */}
      {legal_case && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={20} color="var(--color-warning)" /> Legal Case Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Case Number:</span><br />{legal_case.case_number}</div>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Crime Type:</span><br />{legal_case.case_type}</div>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Court Name:</span><br />{legal_case.court_name}</div>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Sentence Duration:</span><br />{legal_case.sentence_duration}</div>
          </div>
        </div>
      )}

      {/* Incident History */}
      {incidents.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--color-danger)" /> Incident History
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Type</th><th>Action Taken</th></tr></thead>
              <tbody>
                {incidents.map((inc, i) => (
                  <tr key={i}>
                    <td>{inc.date_time}</td>
                    <td><span className={`${styles.badge} ${styles.badgeDanger}`}>{inc.type}</span></td>
                    <td>{inc.action_taken || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disciplinary History */}
      {disciplinary.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--color-danger)" /> Disciplinary History
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Punishment</th><th>Duration</th><th>Notes</th></tr></thead>
              <tbody>
                {disciplinary.map((d, i) => (
                  <tr key={i}>
                    <td>{d.date_imposed}</td>
                    <td>{d.punishment_type}</td>
                    <td>{d.solitary_confinement_duration ? `${d.solitary_confinement_duration} days` : '—'}</td>
                    <td>{d.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Medical History */}
      {medical.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartPulse size={20} color="var(--color-success)" /> Medical History
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Notes</th></tr></thead>
              <tbody>
                {medical.map((m, i) => (
                  <tr key={i}>
                    <td>{m.date_time}</td>
                    <td>{m.doctor_name}</td>
                    <td>{m.diagnosis || '—'}</td>
                    <td>{m.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
