import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../services/authentication';
import { getPrisons } from '../../data/mockData';

export const InmateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    date_of_birth: '',
    gender: 'Male',
    nationality: '',
    occupation: '',
    start_date: '',
    assigned_prison: '',
    case_number: '',
    crime_type: '',
    court_name: '',
    sentence_years: '',
    sentence_months: '',
    sentence_days: '',
  });
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPrisons(getPrisons());
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm('/inmates/add', formData);
    navigate('/inmates');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admit New Inmate</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '100%' }}>
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Personal Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Full Name *</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>National ID</label>
              <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={styles.formControl}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', paddingBottom: '8px' }}>Prison Assignment (Step 1)</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Consider location, security level, legal case, sentence, age, and health conditions.</p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Assign to Prison *</label>
            <select name="assigned_prison" value={formData.assigned_prison} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Prison —</option>
              {prisons.map(p => (
                <option key={p.prison_id} value={p.prison_id}>
                  {p.name} ({p.type} / {p.security_level}) — {p.current_occupancy}/{p.total_capacity}
                </option>
              ))}
            </select>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Legal Case Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Case Number</label>
              <input type="text" name="case_number" value={formData.case_number} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Crime Type</label>
              <select name="crime_type" value={formData.crime_type} onChange={handleChange} className={styles.formControl}>
                <option value="">— Select —</option>
                {['Murder', 'Assault', 'Theft', 'Burglary', 'Drug Possession', 'Drug Trafficking', 'Fraud', 'Armed Robbery', 'Manslaughter', 'Terrorism', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Court Name</label>
              <input type="text" name="court_name" value={formData.court_name} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Sentence Duration</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <input type="number" name="sentence_years" value={formData.sentence_years} onChange={handleChange} min="0" placeholder="Years" className={styles.formControl} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Years</span>
                </div>
                <div>
                  <input type="number" name="sentence_months" value={formData.sentence_months} onChange={handleChange} min="0" max="11" placeholder="Months" className={styles.formControl} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Months</span>
                </div>
                <div>
                  <input type="number" name="sentence_days" value={formData.sentence_days} onChange={handleChange} min="0" max="30" placeholder="Days" className={styles.formControl} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Days</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Admit Inmate</button>
            <Link to="/inmates" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
