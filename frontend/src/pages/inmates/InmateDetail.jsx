import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Scale, AlertTriangle, ShieldAlert, HeartPulse, LogOut } from 'lucide-react';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';
import { postForm } from '../../services/authentication';

export const InmateDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/inmates/${id}`).then(r => r.json()),
      fetch(`/api/incidents/inmate/${id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/disciplinary/inmate/${id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/medical_visit/inmate/${id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/legal_case/inmate/${id}`).then(r => r.json()).catch(() => []),
    ]).then(([inmate, incidents, disciplinary, medical, legal_case]) => {
      setData({ inmate, incidents, disciplinary, medical, legal_case: Array.isArray(legal_case) ? legal_case[0] || null : legal_case });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.emptyState}>Loading Inmate Profile...</div>;
  if (!data || !data.inmate) return <div className={styles.emptyState}>Inmate not found.</div>;

  const { inmate, legal_case, incidents = [], disciplinary = [], medical = [] } = data;

  const releaseInmate = async () => {
    if (!window.confirm('Release this inmate?')) return;
    await postForm(`/inmates/${id}/release`, {});
    window.location.href = '/inmates';
  };

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
          <h1 className={styles.prisonTitle}>Inmate Profile — {inmate.full_name}</h1>
        </header>

        {/* Personal Info */}
        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Personal Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '14px 0' }}>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Inmate ID:</span><br /><strong>{inmate.inmate_id}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>National ID:</span><br />{inmate.national_id || '—'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Date of Birth:</span><br />{inmate.date_of_birth || '—'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Gender:</span><br />{inmate.gender}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Nationality:</span><br />{inmate.nationality || '—'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Occupation:</span><br />{inmate.occupation || '—'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Start Date:</span><br />{inmate.start_date || '—'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Release Date:</span><br />{inmate.release_date || '—'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status:</span><br />
              <span className={`${styles.badge} ${inmate.status === 'active' ? styles.badgeSuccess : inmate.status === 'released' ? styles.badgeInfo : styles.badgeWarning}`}>
                {inmate.status}
              </span>
            </div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Prison:</span><br />{inmate.prison_name || 'Unassigned'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Block:</span><br />{inmate.block_name || 'Unassigned'}</div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Cell:</span><br />{inmate.assigned_cell ? `Cell #${inmate.assigned_cell}` : 'Unassigned'}</div>
          </div>
        </div>

        {/* Legal Case */}
        {legal_case && (
          <div className={styles.detailPanel}>
            <h3><Scale size={16} style={{ marginRight: '6px' }} /> Legal Case Information</h3>
            <div className={styles.detailGrid}>
              <div><span>Case Number</span><strong>{legal_case.case_number}</strong></div>
              <div><span>Crime Type</span><strong>{legal_case.case_type}</strong></div>
              <div><span>Court Name</span><strong>{legal_case.court_name}</strong></div>
              <div><span>Sentence Duration</span><strong>{legal_case.sentence_duration}</strong></div>
            </div>
          </div>
        )}

        {/* Incident History */}
        {incidents.length > 0 && (
          <div className={styles.ledger}>
            <div className={styles.ledgerTitle}><AlertTriangle size={16} style={{ marginRight: '6px' }} /> Incident History</div>
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
          <div className={styles.ledger}>
            <div className={styles.ledgerTitle}><ShieldAlert size={16} style={{ marginRight: '6px' }} /> Disciplinary History</div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Date</th><th>Punishment</th><th>Duration</th><th>Notes</th></tr></thead>
                <tbody>
                  {disciplinary.map((d, i) => (
                    <tr key={i}>
                      <td>{d.date_imposed || '—'}</td>
                      <td>{d.punishment_type || '—'}</td>
                      <td>{d.solitary_confinement_duration ? `${d.solitary_confinement_duration} days` : '—'}</td>
                      <td className={styles.notesCell}>{d.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Medical History */}
        {medical.length > 0 && (
          <div className={styles.ledger}>
            <div className={styles.ledgerTitle}><HeartPulse size={16} style={{ marginRight: '6px' }} /> Medical History</div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Notes</th></tr></thead>
                <tbody>
                  {medical.map((m, i) => (
                    <tr key={i}>
                      <td>{m.date_time || '—'}</td>
                      <td>{m.doctor_name || '—'}</td>
                      <td>{m.diagnosis || '—'}</td>
                      <td className={styles.notesCell}>{m.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasRole('manager') && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {!inmate.assigned_cell && (
              <Link to={`/inmates/${id}/assign`} className={`${styles.btn} ${styles.badgeWarning}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Assign to Cell
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
