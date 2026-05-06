import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';

import { useToast } from '../../context/ToastContext';

export const IncidentForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    type: '',
    date_time: '',
    block_id: '',
    cell_id: '',
    description: '',
    action_taken: '',
    inmate_ids: [],
    staff_ids: [],
    witness_ids: [],
    reporting_officer: ''
  });
  const [data, setData] = useState({ blocks: [], inmates: [], staff: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/inmates').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
      fetch('/api/prison').then(r => r.json())
        .then(prisons => Promise.all(
          prisons.map(p => fetch(`/api/prison/${p.prison_id}/blocks-cells`).then(r => r.json()))
        )).then(all => all.flat()),
    ]).then(([inmates, staff, blocks]) => {
      setData({ blocks, inmates, staff });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentIds = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentIds, value] };
      } else {
        return { ...prev, [field]: currentIds.filter(id => id !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.reporting_officer) {
        toast.error('Validation Error', 'Please select a reporting officer.');
        return;
      }
      
      const payload = {
        type: formData.type,
        block_id: formData.block_id ? parseInt(formData.block_id, 10) : null,
        occurred_at: formData.date_time,
        reporting_officer: formData.reporting_officer,
        description: formData.description,
        action_taken: formData.action_taken,
        involved_inmate_ids: formData.inmate_ids.map(id => parseInt(id, 10))
      };

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('API Error:', responseBody);
        throw new Error(responseBody.detail || 'Submission Failed');
      }
      toast.success('Incident Reported', 'The incident report has been successfully filed.');
      navigate('/incidents');
    } catch (err) {
      toast.error('Reporting Failed', 'There was an error filing the incident report. Please check required fields.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Report Incident</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Incident Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required className={styles.formControl}>
                <option value="">— Select —</option>
                {['Fight', 'Self-Harm', 'Escape Attempt', 'Property Damage', 'Assault on Staff', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date & Time</label>
              <input type="datetime-local" name="date_time" value={formData.date_time} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Reporting Officer *</label>
            <select name="reporting_officer" value={formData.reporting_officer} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Reporting Officer —</option>
              {data.staff.map(s => (
                <option key={s.national_id} value={s.national_id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Block</label>
              <select name="block_id" value={formData.block_id} onChange={handleChange} className={styles.formControl}>
                <option value="">— Select —</option>
                {data.blocks.map(b => <option key={b.block_id} value={b.block_id}>Block {b.block_id}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Cell ID (optional)</label>
              <input type="number" name="cell_id" value={formData.cell_id} onChange={handleChange} placeholder="Cell number" className={styles.formControl} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required className={styles.formControl} placeholder="Narrative description of the incident"></textarea>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Action Taken</label>
            <textarea name="action_taken" value={formData.action_taken} onChange={handleChange} rows="3" className={styles.formControl} placeholder="Immediate response measures applied"></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Inmates Involved</label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', background: 'var(--bg-primary)' }}>
                {data.inmates.map(i => (
                  <label key={i.inmate_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" value={i.inmate_id} checked={formData.inmate_ids.includes(String(i.inmate_id))} onChange={(e) => handleCheckboxChange(e, 'inmate_ids')} /> {i.full_name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Staff Involved</label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', background: 'var(--bg-primary)' }}>
                {data.staff.map(s => (
                  <label key={s.national_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" value={s.national_id} checked={formData.staff_ids.includes(s.national_id)} onChange={(e) => handleCheckboxChange(e, 'staff_ids')} /> {s.name} ({s.role})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Witnesses</label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', background: 'var(--bg-primary)' }}>
                {data.inmates.map(i => (
                  <label key={i.inmate_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" value={i.inmate_id} checked={formData.witness_ids.includes(String(i.inmate_id))} onChange={(e) => handleCheckboxChange(e, 'witness_ids')} /> {i.full_name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Submit Incident Report</button>
            <Link to="/incidents" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
