import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { useToast } from '../../context/ToastContext';

export const InmateForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    date_of_birth: '',
    gender: 'Male',
    nationality: '',
    occupation: '',
    start_date: '',
    education_level: 'Illiterate',
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
        national_id: formData.national_id,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        nationality: formData.nationality,
        start_date: formData.start_date,
        education_level: formData.education_level
      };

      if (formData.occupation) {
        payload.occupation = formData.occupation;
      }
      
      if (formData.assigned_prison) {
        payload.assigned_prison = parseInt(formData.assigned_prison);
      }

      const response = await fetch('/api/pending_inmates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      
      const payloadResponse = await response.json();

      if (formData.crime_type && formData.court_name) {
        const casePayload = {
          crime_type: formData.crime_type,
          inmate_id: payloadResponse.pending_inmate_id || payloadResponse.inmate_id,
          court_name: formData.court_name,
          sentence_duration_years: formData.sentence_years ? parseInt(formData.sentence_years) : 0,
          sentence_duration_months: formData.sentence_months ? parseInt(formData.sentence_months) : 0,
          sentence_duration_days: formData.sentence_days ? parseInt(formData.sentence_days) : 0,
        };
        await fetch('/api/legal_case', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(casePayload),
        });
      }

      toast.success('Inmate Admitted', `${formData.full_name} has been successfully added to the pending queue.`);
      navigate('/inmates');
    } catch (error) {
      console.error(error);
      toast.error('Admission Failed', 'There was an error admitting the inmate. Please check all required fields.');
    }
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>National ID *</label>
              <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} required className={styles.formControl} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date of Birth *</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className={styles.formControl}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Nationality *</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required className={styles.formControl} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Education Level *</label>
              <select name="education_level" value={formData.education_level} onChange={handleChange} className={styles.formControl} required>
                <option value="Illiterate">Illiterate</option>
                <option value="Literate">Literate</option>
                <option value="Primary">Primary</option>
                <option value="Preparatory">Preparatory</option>
                <option value="Secondary">Secondary</option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Postgraduate education">Postgraduate education</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Start Date *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className={styles.formControl} />
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
