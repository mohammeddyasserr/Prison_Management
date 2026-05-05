import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { useToast } from '../../context/ToastContext';

export const OfficerForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    national_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    prison_id: '',
    password: ''
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // The backend schema requires prison_id as int
      if (!formData.prison_id) {
        toast.error('Creation Failed', 'Please select an Assigned Prison.');
        return;
      }

      const response = await fetch('/api/login/create_officer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          national_id: formData.national_id,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
          password: formData.password,
          prison_id: parseInt(formData.prison_id)
        })
      });

      if (!response.ok) {
        let errorMsg = 'Submission failed';
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch (e) {
          console.error(e);
        }
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }

      toast.success('Account Created', `Staff account for ${formData.name} has been successfully created.`);
      navigate('/officers');
    } catch (err) {
      toast.error('Creation Failed', err.message || 'There was an error creating the staff account. Please check prison selection and unique ID validation.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add Staff Member</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>National ID *</label>
              <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.formControl} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className={styles.formControl} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Assigned Prison *</label>
              <select name="prison_id" value={formData.prison_id} onChange={handleChange} required className={styles.formControl}>
                <option value="">— None —</option>
                {prisons.map(p => (
                  <option key={p.prison_id} value={p.prison_id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className={styles.formControl} />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Account</button>
            <Link to="/officers" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
