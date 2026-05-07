import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { useToast } from '../../context/ToastContext';

export const InmateForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    date_of_birth: '',
    dob_day: '',
    dob_month: '',
    dob_year: '',
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob_day' || name === 'dob_month' || name === 'dob_year') {
        const day = updated.dob_day?.padStart(2, '0');
        const month = updated.dob_month?.padStart(2, '0');
        const year = updated.dob_year;
        if (day && month && year) {
          updated.date_of_birth = `${year}-${month}-${day}`;
        } else {
          updated.date_of_birth = '';
        }
      }
      return updated;
    });
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
        headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
          <h1 className={styles.prisonTitle}>Admit New Inmate</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Personal Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
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
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date of Birth *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <select 
                      name="dob_day"
                      value={formData.dob_day}
                      onChange={handleChange}
                      required
                      className={styles.formInput}
                    >
                      <option value="">Day</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select 
                      name="dob_month"
                      value={formData.dob_month}
                      onChange={handleChange}
                      required
                      className={styles.formInput}
                    >
                      <option value="">Month</option>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select 
                      name="dob_year"
                      value={formData.dob_year}
                      onChange={handleChange}
                      required
                      className={styles.formInput}
                    >
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gender *</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nationality *</label>
                  <input 
                    type="text" 
                    name="nationality" 
                    value={formData.nationality} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Occupation</label>
                  <input 
                    type="text" 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Education Level *</label>
                  <select 
                    name="education_level" 
                    value={formData.education_level} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  >
                    <option value="Illiterate">Illiterate</option>
                    <option value="Literate">Literate</option>
                    <option value="Primary">Primary</option>
                    <option value="Preparatory">Preparatory</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Postgraduate education">Postgraduate education</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Start Date *</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    value={formData.start_date} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Prison Assignment</h2>
              <p style={{ fontSize: '0.8rem', color: '#7a6a58', marginBottom: '16px' }}>Consider location, security level, legal case, sentence, age, and health conditions.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assign to Prison *</label>
                <select 
                  name="assigned_prison" 
                  value={formData.assigned_prison} 
                  onChange={handleChange} 
                  required 
                  className={styles.formInput}
                >
                  <option value="">— Select Prison —</option>
                  {prisons.map(p => (
                    <option key={p.prison_id} value={p.prison_id}>
                      {p.name} ({p.type} / {p.security_level}) — {p.current_occupancy}/{p.total_capacity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Legal Case Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Case Number</label>
                  <input 
                    type="text" 
                    name="case_number" 
                    value={formData.case_number} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Crime Type</label>
                  <select 
                    name="crime_type" 
                    value={formData.crime_type} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  >
                    <option value="">— Select —</option>
                    {['Murder', 'Assault', 'Theft', 'Burglary', 'Drug Possession', 'Drug Trafficking', 'Fraud', 'Armed Robbery', 'Manslaughter', 'Terrorism', 'Other'].map(c => 
                      <option key={c}>{c}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Court Name</label>
                  <input 
                    type="text" 
                    name="court_name" 
                    value={formData.court_name} 
                    onChange={handleChange} 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sentence Duration</label>
                  <div className={styles.formRow} style={{ gridTemplateColumns: '1fr 1fr 1fr', margin: 0 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#7a6a58', marginBottom: '4px', display: 'block' }}>Years</label>
                      <input 
                        type="number" 
                        name="sentence_years" 
                        value={formData.sentence_years} 
                        onChange={handleChange} 
                        min="0" 
                        placeholder="0" 
                        className={styles.formInput}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#7a6a58', marginBottom: '4px', display: 'block' }}>Months</label>
                      <input 
                        type="number" 
                        name="sentence_months" 
                        value={formData.sentence_months} 
                        onChange={handleChange} 
                        min="0" 
                        max="11" 
                        placeholder="0" 
                        className={styles.formInput}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#7a6a58', marginBottom: '4px', display: 'block' }}>Days</label>
                      <input 
                        type="number" 
                        name="sentence_days" 
                        value={formData.sentence_days} 
                        onChange={handleChange} 
                        min="0" 
                        max="30" 
                        placeholder="0" 
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Admit Inmate</button>
              <Link to="/inmates" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
