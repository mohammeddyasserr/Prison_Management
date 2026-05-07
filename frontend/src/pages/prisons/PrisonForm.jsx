import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
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
    security_level: 'High',
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
      const staffRes = await fetch('/api/staff/officers').then(r => r.json()).catch(() => []);
      setManagers(staffRes);

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

  if (loading) return <div className={styles.emptyState}>Loading Form...</div>;

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
          <h1 className={styles.prisonTitle}>{id ? 'Edit' : 'Add New'} Prison</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Core Facility Information</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Prison Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    required 
                    className={styles.formInput}
                    placeholder="City / Governorate"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    className={styles.formSelect}
                  >
                    {['Maximum Security', 'Minimum Security', 'Remand', 'Juvenile', "Women's"].map(t => 
                      <option key={t}>{t}</option>
                    )}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Security Level</label>
                  <select 
                    name="security_level" 
                    value={formData.security_level} 
                    onChange={handleChange} 
                    className={styles.formSelect}
                  >
                    {['High', 'Medium', 'Low'].map(sl => 
                      <option key={sl}>{sl}</option>
                    )}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Assign Manager</label>
                  <select 
                    name="manager_id" 
                    value={formData.manager_id} 
                    onChange={handleChange} 
                    className={styles.formSelect}
                  >
                    <option value="">— No Officer Assigned —</option>
                    {managers.map(m => (
                      <option key={m.national_id} value={m.national_id}>
                        {m.name} ({m.national_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Facility Features</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: '#6a5742' }}>
                  <input 
                    type="checkbox" 
                    name="has_hospital" 
                    checked={formData.has_hospital} 
                    onChange={handleChange} 
                    style={{ width: '18px', height: '18px' }}
                  /> 
                  Infirmary / Hospital
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: '#6a5742' }}>
                  <input 
                    type="checkbox" 
                    name="has_workshops" 
                    checked={formData.has_workshops} 
                    onChange={handleChange} 
                    style={{ width: '18px', height: '18px' }}
                  /> 
                  Workshops
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: '#6a5742' }}>
                  <input 
                    type="checkbox" 
                    name="has_agricultural_ward" 
                    checked={formData.has_agricultural_ward} 
                    onChange={handleChange} 
                    style={{ width: '18px', height: '18px' }}
                  /> 
                  Agricultural Ward
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: '#6a5742' }}>
                  <input 
                    type="checkbox" 
                    name="has_visitation_hall" 
                    checked={formData.has_visitation_hall} 
                    onChange={handleChange} 
                    style={{ width: '18px', height: '18px' }}
                  /> 
                  Visitation Hall
                </label>
              </div>

              {formData.has_visitation_hall && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Visitation Hall Capacity</label>
                  <input 
                    type="number" 
                    name="visitation_hall_capacity" 
                    value={formData.visitation_hall_capacity} 
                    onChange={handleChange} 
                    min="0" 
                    className={styles.formInput}
                    style={{ width: '200px' }}
                  />
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                {id ? 'Update Prison' : 'Create Prison'}
              </button>
              <Link to="/prisons" className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
