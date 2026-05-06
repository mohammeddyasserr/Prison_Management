import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const TransferForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    inmate_id: '',
    destination_prison: '',
    reason: ''
  });
  const [data, setData] = useState({ inmates: [], prisons: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const prisonId = user.assigned_prison || 1; // Fallback or current prison context

    Promise.all([
      fetch('/api/inmates').then(r => r.json()).then(inmates => 
        inmates.filter(i => String(i.assigned_prison) === String(prisonId))
      ),
      fetch('/api/prison').then(r => r.json()).then(prisons =>
        prisons.filter(p => String(p.prison_id) !== String(prisonId))
      ),
    ]).then(([inmates, prisons]) => {
      setData({ inmates, prisons });
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
      const inmate = data.inmates.find(i => String(i.inmate_id) === String(formData.inmate_id));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const payload = {
        inmate_id: Number(formData.inmate_id),
        destination_prison: Number(formData.destination_prison),
        reason: formData.reason,
        requesting_prison: Number(inmate?.assigned_prison || 0),
        manager_id: Number(localStorage.getItem('userNationalId') || 0)
      };

      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Submission failed');

      toast.success('Request Submitted', 'The inter-prison transfer request has been submitted for review.');
      navigate('/transfers');
    } catch (err) {
      console.error(err);
      toast.error('Submission Failed', 'There was an error submitting the transfer request. Please try again.');
    }
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
