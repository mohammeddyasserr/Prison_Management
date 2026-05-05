import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../services/authentication';
import { getInmates, getDoctors } from '../../data/mockData';

export const MedicalVisitForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inmate_id: '',
    doctor_id: '',
    date_time: '',
    diagnosis: '',
    description: ''
  });
  const [data, setData] = useState({ inmates: [], doctors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData({
      inmates: getInmates().filter(i => i.status === 'active'),
      doctors: getDoctors(),
    });
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm('/healthcare/visits/add', formData);
    navigate('/healthcare');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Record Medical Visit</h1>

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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Doctor *</label>
            <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Doctor —</option>
              {data.doctors.map(d => (
                <option key={d.national_id} value={d.national_id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date & Time *</label>
            <input type="datetime-local" name="date_time" value={formData.date_time} onChange={handleChange} required className={styles.formControl} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Diagnosis</label>
            <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange} className={styles.formControl} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Description / Notes</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={styles.formControl}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Record Visit</button>
            <Link to="/healthcare" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
