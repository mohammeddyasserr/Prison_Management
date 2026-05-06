import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';

import { useToast } from '../../context/ToastContext';

export const DisciplinaryForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    inmate_id: '',
    incident_id: '',
    punishment_type: 'Loss of Privileges',
    solitary_days: 0,
    date_imposed: '',
    imposed_by: '',
    notes: ''
  });
  const [data, setData] = useState({ inmates: [], incidents: [], staff: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/inmates').then(r => r.json()),
      fetch('/api/incidents').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
    ]).then(([inmates, incidents, staff]) => {
      setData({ inmates, incidents, staff });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.inmate_id) {
        toast.error('Validation Error', 'Please select an inmate.');
        return;
      }
      if (!formData.date_imposed) {
        toast.error('Validation Error', 'Please select a date.');
        return;
      }
      if (!formData.imposed_by) {
        toast.error('Validation Error', 'Please select the imposing officer.');
        return;
      }
      
      const payload = {
        ...formData,
        inmate_id: parseInt(formData.inmate_id, 10),
        incident_id: formData.incident_id ? parseInt(formData.incident_id, 10) : null,
        solitary_days: formData.solitary_days ? parseInt(formData.solitary_days, 10) : null,
        imposed_by: formData.imposed_by
      };
      const response = await fetch('/api/disciplinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('API Error:', responseBody);
        throw new Error(responseBody.detail || 'Submission Failed');
      }

      toast.success('Record Added', 'The disciplinary action has been recorded.');
      navigate('/disciplinary');
    } catch (err) {
      toast.error('Submission Failed', 'An error occurred while recording the disciplinary action.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add Disciplinary Record</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '100%' }}>
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
                  #{inc.incident_id} — {inc.type} ({new Date(inc.occurred_at).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Punishment Type *</label>
            <select name="punishment_type" value={formData.punishment_type} onChange={handleChange} required className={styles.formControl}>
              {['Loss of Privileges', 'Solitary Confinement', 'Transfer to High-Security', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Solitary Confinement Duration (days, max 30)</label>
            <input type="number" name="solitary_days" value={formData.solitary_days} onChange={handleChange} min="0" max="30" className={styles.formControl} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date Imposed *</label>
            <input type="date" name="date_imposed" value={formData.date_imposed} onChange={handleChange} required className={styles.formControl} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Imposed By (Officer) *</label>
            <select name="imposed_by" value={formData.imposed_by} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Officer —</option>
              {data.staff.map(s => (
                <option key={s.national_id} value={s.national_id}>{s.name} ({s.role})</option>
              ))}
            </select>
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
