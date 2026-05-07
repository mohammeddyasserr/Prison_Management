import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { postForm, hasRole } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const MedicalVisitForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    inmate_id: '',
    doctor_id: '',
    visit_datetime: '',
    diagnosis: '',
    description: ''
  });
  const [data, setData] = useState({ inmates: [], doctors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveAndFetch = async () => {
      try {
        let pid;
        if (hasRole('manager')) {
          const nationalId = localStorage.getItem('userNationalId') || '';
          const prisonRes = await fetch(`/api/prison/user/${nationalId}`);
          const prisonData = await prisonRes.json();
          pid = prisonData?.prison_id;
        } else {
          pid = localStorage.getItem('prison_id');
        }
        const inmateUrl = pid ? `/api/inmates/prison/${pid}` : '/api/inmates';
        const doctorUrl = pid ? `/api/doctor/prison/${pid}` : '/api/doctor';
        const [inmates, doctors] = await Promise.all([
          fetch(inmateUrl).then(r => r.json()),
          fetch(doctorUrl).then(r => r.json()),
        ]);
        setData({ inmates, doctors });
      } catch {
        // data fetch failed
      } finally {
        setLoading(false);
      }
    };
    resolveAndFetch();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        inmate_id: parseInt(formData.inmate_id, 10),
        doctor_id: formData.doctor_id,
        visit_datetime: new Date(formData.visit_datetime).toISOString(),
        diagnosis: formData.diagnosis,
        description: formData.description
      };

      const response = await fetch('/api/medical-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Recording Failed');
      }

      toast.success('Visit Recorded', 'The medical visit has been successfully logged.');
      navigate('/healthcare');
    } catch (err) {
      toast.error('Recording Failed', err.message || 'There was an error logging the medical visit.');
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
          <h1 className={styles.prisonTitle}>Record Medical Visit</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Visit Details</h2>

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
                <label className={styles.formLabel}>Doctor *</label>
                <select 
                  name="doctor_id" 
                  value={formData.doctor_id} 
                  onChange={handleChange} 
                  required 
                  className={styles.formSelect}
                >
                  <option value="">— Select Doctor —</option>
                  {data.doctors.map(d => 
                    <option key={d.national_id} value={d.national_id}>{d.name}</option>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date & Time *</label>
                <input 
                  type="datetime-local" 
                  name="visit_datetime" 
                  value={formData.visit_datetime} 
                  onChange={handleChange} 
                  required 
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Diagnosis</label>
                <input 
                  type="text" 
                  name="diagnosis" 
                  value={formData.diagnosis} 
                  onChange={handleChange} 
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description / Notes</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="3" 
                  className={styles.formTextarea}
                ></textarea>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Record Visit</button>
              <Link to="/healthcare" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
