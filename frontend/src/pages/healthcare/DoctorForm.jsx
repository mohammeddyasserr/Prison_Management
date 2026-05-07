import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { postForm } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const DoctorForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    national_id: '',
    name: '',
    address: '',
    phone: '',
    prison_id: ''
  });
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prison')
      .then(r => r.json())
      .then(data => { setPrisons(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        prison_id: parseInt(formData.prison_id, 10)
      };

      const response = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration Failed');
      }

      toast.success('Doctor Registered', `Dr. ${formData.name} has been added to the healthcare system.`);
      navigate('/healthcare');
    } catch (err) {
      toast.error('Registration Failed', err.message || 'There was an error registering the doctor.');
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
          <h1 className={styles.prisonTitle}>Add Doctor</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Doctor Information</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>National ID *</label>
                  <input 
                    type="text" 
                    name="national_id" 
                    value={formData.national_id} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assigned Prison *</label>
                <select 
                  name="prison_id" 
                  value={formData.prison_id} 
                  onChange={handleChange} 
                  required 
                  className={styles.formSelect}
                >
                  <option value="">— Select Prison —</option>
                  {prisons.map(p => 
                    <option key={p.prison_id} value={p.prison_id}>{p.name}</option>
                  )}
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Add Doctor</button>
              <Link to="/healthcare" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};