import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { postForm } from '../../services/authentication';
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
          <h1 className={styles.prisonTitle}>Add Disciplinary Record</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Disciplinary Action</h2>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Inmate *</label>
                <select 
                  name="inmate_id" 
                  value={formData.inmate_id} 
                  onChange={handleChange} 
                  required 
                  className={styles.formSelect}
                >
                  <option value="">— Select Inmate —</option>
                  {data.inmates.map(i => 
                    <option key={i.inmate_id} value={i.inmate_id}>
                      {i.full_name} (ID: {i.inmate_id})
                    </option>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Linked Incident (optional)</label>
                <select 
                  name="incident_id" 
                  value={formData.incident_id} 
                  onChange={handleChange} 
                  className={styles.formSelect}
                >
                  <option value="">— No linked incident —</option>
                  {data.incidents.map(inc => 
                    <option key={inc.incident_id} value={inc.incident_id}>
                      #{inc.incident_id} — {inc.type} ({inc.date_time})
                    </option>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Punishment Type *</label>
                <select 
                  name="punishment_type" 
                  value={formData.punishment_type} 
                  onChange={handleChange} 
                  required 
                  className={styles.formSelect}
                >
                  {['Loss of Privileges', 'Solitary Confinement', 'Transfer to High-Security', 'Restricted Visits', 'Extra Labor', 'Other'].map(t => 
                    <option key={t}>{t}</option>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Solitary Confinement Duration (days, max 30)</label>
                <input 
                  type="number" 
                  name="solitary_confinement_duration" 
                  value={formData.solitary_confinement_duration} 
                  onChange={handleChange} 
                  min="0" 
                  max="30" 
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date Imposed *</label>
                  <input 
                    type="date" 
                    name="date_imposed" 
                    value={formData.date_imposed} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>End Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    value={formData.end_date} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows="3" 
                  className={styles.formTextarea}
                ></textarea>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Record Disciplinary Action</button>
              <Link to="/disciplinary" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
