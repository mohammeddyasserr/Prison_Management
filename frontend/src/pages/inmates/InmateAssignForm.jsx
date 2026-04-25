import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';
import { postForm } from '../../lib/http';

export const InmateAssignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    block_id: '',
    cell_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/inmates/api/assign-data/${id}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch assignment data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'block_id' ? { cell_id: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm(`/inmates/${id}/assign`, formData);
    navigate(`/inmates/${id}`);
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>;
  if (!data || data.error) return <div style={{padding: '40px', textAlign: 'center'}}>Inmate not found.</div>;

  const { inmate, blocks, block_cells } = data;
  const availableCells = formData.block_id ? block_cells[formData.block_id] || [] : [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Assign Cell — {inmate.full_name}</h1>
      
      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', maxWidth: '600px'}}>
        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px'}}>
          PRD 4.1 Stage 2: The Prison Manager assigns the inmate to a specific block and cell.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Block</label>
            <select name="block_id" value={formData.block_id} onChange={handleChange} required className={styles.formControl}>
              <option value="">— Select Block —</option>
              {blocks.map(b => (
                <option key={b.block_id} value={b.block_id}>
                  {b.name} ({b.security_level}) — {b.current_occupancy}/{b.capacity}
                </option>
              ))}
            </select>
          </div>

          <div style={{marginBottom: '32px'}}>
            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px'}}>Cell</label>
            <select name="cell_id" value={formData.cell_id} onChange={handleChange} required className={styles.formControl} disabled={!formData.block_id}>
              <option value="">{formData.block_id ? '— Select Cell —' : '— Select Block First —'}</option>
              {availableCells.map(c => (
                <option key={c.cell_id} value={c.cell_id}>
                  Cell #{c.cell_id} ({c.current_occupancy}/{c.capacity})
                </option>
              ))}
            </select>
          </div>

          <div style={{display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)'}}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Assign Cell</button>
            <Link to={`/inmates/${id}`} className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
