import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../lib/http';

export const OfficerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    national_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'officer',
    prison_id: '',
    password: ''
  });
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/officers/api/form-data');
        const result = await response.json();
        setPrisons(result.prisons || []);
      } catch (error) {
        console.error("Failed to fetch prisons:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm('/officers/add', formData);
    navigate('/officers');
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add Staff Member</h1>
      
      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '700px'}}>
        <form onSubmit={handleSubmit}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>National ID *</label>
              <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.formControl} />
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formControl} />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={styles.formControl} />
            </div>
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className={styles.formControl} />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} required className={styles.formControl}>
                <option value="officer">Officer</option>
                <option value="prison_manager">Prison Manager</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Assigned Prison</label>
              <select name="prison_id" value={formData.prison_id} onChange={handleChange} className={styles.formControl}>
                <option value="">— None —</option>
                {prisons.map(p => (
                  <option key={p.prison_id} value={p.prison_id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{marginBottom: '32px'}}>
            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className={styles.formControl} />
          </div>

          <div style={{display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)'}}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Account</button>
            <Link to="/officers" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
