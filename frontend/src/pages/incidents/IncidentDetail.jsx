import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Info, User, Shield, ArrowLeft } from 'lucide-react';
import styles from '../PrisonStyles.module.css';

export const IncidentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disciplinary, setDisciplinary] = useState([]);
  const [discLoading, setDiscLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch incident details
    fetch(`/api/incidents/${id}`, { headers })
      .then(r => r.json())
      .then(incident => {
        const inmateIds = (incident.involved_inmate_ids || '').split(',').map(s => s.trim()).filter(Boolean);
        const inmateNames = (incident.involved_inmate_names || '').split(',').map(s => s.trim()).filter(Boolean);
        const involved_inmates = inmateIds.map((id, idx) => ({
          inmate_id: id,
          full_name: inmateNames[idx] || `Inmate ${id}`
        }));
        setData({ incident, involved_inmates, involved_staff: [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch linked disciplinary records
    fetch(`/api/disciplinary/incident/${id}`, { headers })
      .then(r => r.json())
      .then(records => {
        setDisciplinary(Array.isArray(records) ? records : []);
        setDiscLoading(false);
      })
      .catch(() => setDiscLoading(false));
  }, [id]);

  if (loading) return <div className={styles.emptyState}>Loading Incident Report...</div>;
  if (!data || !data.incident) return <div className={styles.emptyState}>Incident not found.</div>;

  const { incident, involved_inmates, involved_staff } = data;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className={styles.prisonTitle}>Incident Report #{incident.incident_id}</h1>
            <Link to="/incidents" className={`${styles.btn} ${styles.btnOutline}`}>
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </header>

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}><Info size={16} style={{ marginRight: '6px' }} /> Incident Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '14px 0' }}>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Type:</span><br /><span className={`${styles.badge} ${styles.badgeDanger}`}>{incident.type}</span></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Date/Time:</span><br /><strong>{new Date(incident.occurred_at).toLocaleString()}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Prison:</span><br /><strong>{incident.prison_name || '—'}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Block:</span><br /><strong>{incident.block_id || '—'}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Reporting Officer:</span><br /><strong>{incident.officer_name || '—'}</strong></div>
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
                    <tr key={`${i.source || 'inmate'}-${i.inmate_id}`}>
                      <td>{i.inmate_id}</td>
                      <td>{i.full_name}</td>
                      <td>
                        <Link to={`/inmates/${i.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`}>View</Link>
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

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>
            <AlertTriangle size={16} style={{ marginRight: '6px' }} /> Linked Disciplinary Actions
          </div>
          {discLoading ? (
            <p style={{ padding: '12px', color: '#7a6a58', fontSize: '0.9rem' }}>Loading disciplinary records…</p>
          ) : disciplinary.length === 0 ? (
            <p style={{ padding: '12px', color: '#7a6a58', fontSize: '0.9rem' }}>No disciplinary actions linked to this incident.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Inmate</th>
                    <th>Punishment</th>
                    <th>Duration</th>
                    <th>Date Imposed</th>
                    <th>Imposed By</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplinary.map((d, i) => (
                    <tr key={d.disciplinary_id ?? i}>
                      <td>{d.inmate_name ?? d.inmate_id ?? '—'}</td>
                      <td>{d.punishment_type ?? '—'}</td>
                      <td>{d.solitary_days ? `${d.solitary_days} days` : '—'}</td>
                      <td>{d.date_imposed ? new Date(d.date_imposed).toLocaleDateString() : '—'}</td>
                      <td>{d.officer_name ?? d.imposed_by ?? '—'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{d.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};