import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
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
    reporting_officer: localStorage.getItem('userNationalId') || ''
  });
  const [data, setData] = useState({ blocks: [], inmates: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken') || '';
    const headers = { 'Authorization': `Bearer ${token}` };
    const prisonId = localStorage.getItem('prison_id');

    const fetchData = async () => {
      try {
        const inmatesRes = await fetch('/api/inmates', { headers });
        const allInmates = await inmatesRes.json();

        const inmates = prisonId
          ? allInmates.filter(i => String(i.assigned_prison) === String(prisonId))
          : allInmates;

        let blocks = [];
        if (prisonId) {
          const blocksRes = await fetch(`/api/prison/${prisonId}/blocks-cells`, { headers });
          const blocksData = await blocksRes.json();
          blocks = (blocksData || []).map(b => ({ block_id: b.block_id, security_level: b.security_level }));
        } else {
          const prisons = await fetch('/api/prison', { headers }).then(r => r.json());
          const allPrisons = Array.isArray(prisons) ? prisons : [prisons];
          const blocksArrays = await Promise.all(
            allPrisons.map(p => fetch(`/api/prison/${p.prison_id}/blocks-cells`, { headers }).then(r => r.json()))
          );
          blocks = blocksArrays.flat().map(b => ({ block_id: b.block_id, security_level: b.security_level }));
        }

        console.log('Fetched inmates:', inmates.length, 'blocks:', blocks.length);
        setData({ blocks, inmates });
      } catch (err) {
        console.error('Error fetching form data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      const payload = {
         type: formData.type,
         block_id: formData.block_id ? parseInt(formData.block_id, 10) : null,
         occurred_at: formData.date_time || new Date().toISOString(),
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

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

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
          <h1 className={styles.prisonTitle}>Report Incident</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Incident Details</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Incident Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} required className={styles.formSelect}>
                    <option value="">— Select —</option>
                    {['Fight', 'Self-Harm', 'Escape Attempt', 'Property Damage', 'Assault on Staff', 'Other'].map(t =>
                      <option key={t}>{t}</option>
                    )}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date & Time</label>
                  <input type="datetime-local" name="date_time" value={formData.date_time} onChange={handleChange} className={styles.formInput} />
                </div>
              </div>

               <input type="hidden" name="reporting_officer" value={formData.reporting_officer} />

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Block</label>
                  <select name="block_id" value={formData.block_id} onChange={handleChange} className={styles.formSelect}>
                    <option value="">— Select —</option>
                    {data.blocks.map(b => <option key={b.block_id} value={b.block_id}>Block {b.block_id}</option>)}
                  </select>
                </div>

              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required className={styles.formTextarea} placeholder="Narrative description of the incident"></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Action Taken</label>
                <textarea name="action_taken" value={formData.action_taken} onChange={handleChange} rows="3" className={styles.formTextarea} placeholder="Immediate response measures applied"></textarea>
              </div>

              <div>
                 <label style={{ display: 'block', fontSize: '0.76rem', color: '#6a5742', marginBottom: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Inmates Involved</label>
                 <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(120, 0, 0, 0.2)', borderRadius: '6px', padding: '10px', background: 'rgba(255, 249, 232, 0.3)' }}>
                   {data.inmates.map(i => (
                     <label key={i.inmate_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '6px', cursor: 'pointer', color: '#2c1a0e' }}>
                       <input type="checkbox" value={i.inmate_id} checked={formData.inmate_ids.includes(String(i.inmate_id))} onChange={(e) => handleCheckboxChange(e, 'inmate_ids')} style={{ accentColor: '#7a0000' }} /> {i.full_name}
                     </label>
                   ))}
                 </div>
               </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Submit Incident Report</button>
              <Link to="/incidents" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};