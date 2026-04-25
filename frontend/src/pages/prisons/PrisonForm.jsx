import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../lib/http';

export const PrisonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Maximum Security',
    security_level: 'Maximum',
    total_capacity: '',
    manager_id: '',
    infirmary: false,
    workshops: false,
    agricultural_ward: false,
    visitation_hall: false,
    visitation_hall_capacity: 0
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = id ? `/api/prisons/api/form-data?prison_id=${id}` : '/api/prisons/api/form-data';
        const response = await fetch(url);
        const result = await response.json();
        setManagers(result.managers || []);
        if (result.prison) {
          setFormData({
            ...result.prison,
            infirmary: result.features?.infirmary || false,
            workshops: result.features?.workshops || false,
            agricultural_ward: result.features?.agricultural_ward || false,
            visitation_hall: result.features?.visitation_hall || false,
            visitation_hall_capacity: result.features?.visitation_hall_capacity || 0,
            manager_id: result.prison.manager_id || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    await postForm(
      id ? `/prisons/${id}/edit` : '/prisons/add',
      {
        ...formData,
        infirmary: formData.infirmary ? '1' : '0',
        workshops: formData.workshops ? '1' : '0',
        agricultural_ward: formData.agricultural_ward ? '1' : '0',
        visitation_hall: formData.visitation_hall ? '1' : '0',
      }
    );
    navigate(id ? `/prisons/${id}` : '/prisons');
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Form...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{id ? 'Edit' : 'Add New'} Prison</h1>
      
      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '800px'}}>
        <form onSubmit={handleSubmit}>
          <h3 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)'}}>Core Facility Information</h3>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Prison Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.formControl} />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className={styles.formControl} placeholder="City / Governorate" />
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className={styles.formControl}>
                {['Maximum Security', 'Minimum Security', 'Remand', 'Juvenile', "Women's"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Security Level</label>
              <select name="security_level" value={formData.security_level} onChange={handleChange} className={styles.formControl}>
                {['Maximum', 'High', 'Medium', 'Minimum'].map(sl => <option key={sl}>{sl}</option>)}
              </select>
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Total Capacity</label>
              <input type="number" name="total_capacity" value={formData.total_capacity} onChange={handleChange} required min="1" className={styles.formControl} />
            </div>
          </div>

          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Assign Manager</label>
            <select name="manager_id" value={formData.manager_id} onChange={handleChange} className={styles.formControl}>
              <option value="">— No Manager —</option>
              {managers.map(m => (
                <option key={m.national_id} value={m.national_id}>{m.name} ({m.national_id})</option>
              ))}
            </select>
          </div>

          <h3 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)'}}>Facility Features</h3>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer'}}>
              <input type="checkbox" name="infirmary" checked={formData.infirmary} onChange={handleChange} /> Infirmary / Hospital
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer'}}>
              <input type="checkbox" name="workshops" checked={formData.workshops} onChange={handleChange} /> Workshops
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer'}}>
              <input type="checkbox" name="agricultural_ward" checked={formData.agricultural_ward} onChange={handleChange} /> Agricultural Ward
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer'}}>
              <input type="checkbox" name="visitation_hall" checked={formData.visitation_hall} onChange={handleChange} /> Visitation Hall
            </label>
          </div>

          {formData.visitation_hall && (
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Visitation Hall Capacity</label>
              <input type="number" name="visitation_hall_capacity" value={formData.visitation_hall_capacity} onChange={handleChange} min="0" className={styles.formControl} style={{width: '200px'}} />
            </div>
          )}

          <div style={{display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)'}}>
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
