import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const PrisonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Maximum Security',
    security_level: 'Maximum',
    total_capacity: '',
    manager_id: '',
    has_hospital: false,
    has_workshops: false,
    has_agricultural_ward: false,
    has_visitation_hall: false,
    visitation_hall_capacity: 0
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const staffRes = await fetch('/api/staff').then(r => r.json()).catch(() => []);
      setManagers(staffRes.filter(s => s.role === 'manager'));

      if (id) {
        const prison = await fetch(`/api/prison/${id}`).then(r => r.json()).catch(() => null);
        if (prison) {
          setFormData({
            name: prison.name || '',
            type: prison.type || 'Maximum Security',
            security_level: prison.security_level || 'High',
            location: prison.location || '',
            manager_id: prison.manager_id || '',
            has_hospital: prison.has_hospital || false,
            has_workshops: prison.has_workshops || false,
            has_agricultural_ward: prison.has_agricultural_ward || false,
            has_visitation_hall: prison.has_visitation_hall || false,
            visitation_hall_capacity: prison.visitation_hall_capacity || 0,
          });
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/prison/${id}` : '/api/prison';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          manager_id: formData.manager_id || null,
          visitation_hall_capacity: parseInt(formData.visitation_hall_capacity) || 0,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      toast.success(
        id ? 'Prison Updated' : 'Prison Created',
        `Facility "${formData.name}" has been successfully ${id ? 'updated' : 'added to the system'}.`
      );
      navigate(id ? `/prisons/${id}` : '/prisons');
    } catch (err) {
      toast.error('Submission Failed', 'An error occurred while saving the prison details. Please check your connection.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Form...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{id ? 'Edit' : 'Add New'} Prison</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '100%' }}>
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Core Facility Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Prison Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className={styles.formControl} placeholder="City / Governorate" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className={styles.formControl}>
                {['Maximum Security', 'Minimum Security', 'Remand', 'Juvenile', "Women's"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Security Level</label>
              <select name="security_level" value={formData.security_level} onChange={handleChange} className={styles.formControl}>
                {['High', 'Medium', 'Low'].map(sl => <option key={sl}>{sl}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Assign Manager</label>
            <select name="manager_id" value={formData.manager_id} onChange={handleChange} className={styles.formControl}>
              <option value="">— No Manager —</option>
              {managers.map(m => (
                <option key={m.national_id} value={m.national_id}>{m.name} ({m.national_id})</option>
              ))}
            </select>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Facility Features</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" name="has_hospital" checked={formData.has_hospital} onChange={handleChange} /> Infirmary / Hospital
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" name="has_workshops" checked={formData.has_workshops} onChange={handleChange} /> Workshops
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" name="has_agricultural_ward" checked={formData.has_agricultural_ward} onChange={handleChange} /> Agricultural Ward
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" name="has_visitation_hall" checked={formData.has_visitation_hall} onChange={handleChange} /> Visitation Hall
            </label>
          </div>

          {formData.has_visitation_hall && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Visitation Hall Capacity</label>
              <input type="number" name="visitation_hall_capacity" value={formData.visitation_hall_capacity} onChange={handleChange} min="0" className={styles.formControl} style={{ width: '200px' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {id ? 'Update Prison' : 'Create Prison'}
            </button>
            <Link to="/prisons" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
