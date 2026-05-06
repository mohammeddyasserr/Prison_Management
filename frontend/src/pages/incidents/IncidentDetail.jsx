import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Info, User, Shield, ArrowLeft } from 'lucide-react';
import styles from '../PrisonStyles.module.css';

export const IncidentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then(r => r.json())
      .then(incident => {
        setData({
          incident,
          involved_inmates: incident.involved_inmates || [],
          involved_staff: incident.involved_staff || [],
          disciplinary: incident.disciplinary || [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.emptyState}>Loading Incident Report...</div>;
  if (!data || !data.incident) return <div className={styles.emptyState}>Incident not found.</div>;

  const { incident, involved_inmates, involved_staff, disciplinary } = data;

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
          <h1 className={styles.prisonTitle}>Incident Report #{incident.incident_id}</h1>
          <Link to="/incidents" className={`${styles.btn} ${styles.btnOutline}`}>
            <ArrowLeft size={16} /> Back to Incidents
          </Link>
        </header>

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}><Info size={16} style={{ marginRight: '6px' }} /> Incident Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '14px 0' }}>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Type:</span><br /><span className={`${styles.badge} ${styles.badgeDanger}`}>{incident.type}</span></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Date/Time:</span><br /><strong>{incident.date_time}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Prison:</span><br /><strong>{incident.prison?.name || '—'}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Block:</span><br /><strong>{incident.block?.name || '—'}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Cell:</span><br /><strong>{incident.cell_id ? `#${incident.cell_id}` : '—'}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Reporting Officer:</span><br /><strong>{incident.officer?.name || '—'}</strong></div>
          </div>
        </div>

        <div className={styles.detailPanel}>
          <h3><Info size={16} style={{ marginRight: '6px' }} /> Description</h3>
          <p style={{ lineHeight: 1.6, color: '#2c1a0e' }}>{incident.description || 'No description provided.'}</p>
        </div>

        <div className={styles.detailPanel}>
          <h3><Shield size={16} style={{ marginRight: '6px' }} /> Action Taken</h3>
          <p style={{ lineHeight: 1.6, color: '#2c1a0e' }}>{incident.action_taken || 'No action documented.'}</p>
        </div>

        {involved_inmates.length > 0 && (
          <div className={styles.ledger}>
            <div className={styles.ledgerTitle}><User size={16} style={{ marginRight: '6px' }} /> Inmates Involved</div>
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
          <div className={styles.ledger}>
            <div className={styles.ledgerTitle}><Shield size={16} style={{ marginRight: '6px' }} /> Staff Involved</div>
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

        {disciplinary.length > 0 && (
          <div className={styles.ledger}>
            <div className={styles.ledgerTitle}><AlertTriangle size={16} style={{ marginRight: '6px' }} /> Related Disciplinary Actions</div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Inmate</th><th>Punishment</th><th>Duration</th><th>Date</th><th>Imposed By</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {disciplinary.map((d, i) => (
                    <tr key={i}>
                      <td>{d.inmate_name}</td>
                      <td>{d.punishment_type}</td>
                      <td>{d.solitary_confinement_duration ? `${d.solitary_confinement_duration} days` : '—'}</td>
                      <td>{d.date_imposed}</td>
                      <td>{d.imposed_by_name}</td>
                      <td style={{ fontSize: '0.8rem' }}>{d.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};