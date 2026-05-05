import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../services/authentication';
import { getInmates, getPrisons } from '../../data/mockData';


export const TransferForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inmate_id: '',
    destination_prison: '',
    reason: ''
  });
  const [data, setData] = useState({ inmates: [], prisons: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData({
      inmates: getInmates().filter(i => i.status === 'active'),
      prisons: getPrisons(),
    });
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm('/transfers/add', formData);
    navigate('/transfers');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Request Inter-Prison Transfer</h1>

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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Destination Prison *</label>
            <select name="destination_prison" value={formData.destination_prison} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Destination —</option>
              {data.prisons.map(p => (
                <option key={p.prison_id} value={p.prison_id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Reason for Transfer</label>
            <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" className={styles.formControl} placeholder="Clinical need, security reclassification, overcrowding, court order, etc."></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Submit Transfer Request</button>
            <Link to="/transfers" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
