import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../lib/http';
import { getInmates, getIncidents } from '../../data/mockData';

export const DisciplinaryForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inmate_id: '',
    incident_id: '',
    punishment_type: 'Loss of Privileges',
    solitary_confinement_duration: 0,
    date_imposed: '',
    end_date: '',
    notes: ''
  });
  const [data, setData] = useState({ inmates: [], incidents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData({
      inmates: getInmates().filter(i => i.status === 'active'),
      incidents: getIncidents(),
    });
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm('/disciplinary/add', formData);
    navigate('/disciplinary');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add Disciplinary Record</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Inmate *</label>
            <select name="inmate_id" value={formData.inmate_id} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Inmate —</option>
              {data.inmates.map(i => (
                <option key={i.inmate_id} value={i.inmate_id}>{i.full_name} (ID: {i.inmate_id})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Linked Incident (optional)</label>
            <select name="incident_id" value={formData.incident_id} onChange={handleChange} className={styles.formControl}>
              <option value="">— No linked incident —</option>
              {data.incidents.map(inc => (
                <option key={inc.incident_id} value={inc.incident_id}>
                  #{inc.incident_id} — {inc.type} ({inc.date_time})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Punishment Type *</label>
            <select name="punishment_type" value={formData.punishment_type} onChange={handleChange} required className={styles.formControl}>
              {['Loss of Privileges', 'Solitary Confinement', 'Transfer to High-Security', 'Restricted Visits', 'Extra Labor', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Solitary Confinement Duration (days, max 30)</label>
            <input type="number" name="solitary_confinement_duration" value={formData.solitary_confinement_duration} onChange={handleChange} min="0" max="30" className={styles.formControl} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date Imposed *</label>
              <input type="date" name="date_imposed" value={formData.date_imposed} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>End Date</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className={styles.formControl}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Record Disciplinary Action</button>
            <Link to="/disciplinary" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
