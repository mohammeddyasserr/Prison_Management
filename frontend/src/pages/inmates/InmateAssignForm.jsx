import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';
import { postForm } from '../../services/authentication';

export const InmateAssignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ block_id: '', cell_id: '' });

  useEffect(() => {
    fetch(`/api/inmates/${id}`)
      .then(r => r.json())
      .then(async inmate => {
        const allBlocks = await fetch(`/api/prison`).then(r => r.json())
          .then(prisons => Promise.all(
            prisons.map(p => fetch(`/api/prison/${p.prison_id}/blocks-cells`).then(r => r.json()))
          ));
        const blocks = allBlocks.flat();
        setData({ inmate, blocks });
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  if (loading) return <div className={styles.emptyState}>Loading...</div>;
  if (!data || data.error) return <div className={styles.emptyState}>Inmate not found.</div>;

  const { inmate, blocks, block_cells } = data;
  const availableCells = formData.block_id ? block_cells[formData.block_id] || [] : [];

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
          <h1 className={styles.prisonTitle}>Assign Cell — {inmate.full_name}</h1>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Cell Assignment</h2>
              <p style={{ fontSize: '0.8rem', color: '#7a6a58', marginBottom: '16px' }}>
                PRD 4.1 Stage 2: The Prison Manager assigns the inmate to a specific block and cell.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Block</label>
                <select 
                  name="block_id" 
                  value={formData.block_id} 
                  onChange={handleChange} 
                  required 
                  className={styles.formSelect}
                >
                  <option value="">— Select Block —</option>
                  {blocks.map(b => (
                    <option key={b.block_id} value={b.block_id}>
                      {b.name} ({b.security_level}) — {b.current_occupancy}/{b.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cell</label>
                <select 
                  name="cell_id" 
                  value={formData.cell_id} 
                  onChange={handleChange} 
                  required 
                  className={styles.formSelect}
                  disabled={!formData.block_id}
                >
                  <option value="">{formData.block_id ? '— Select Cell —' : '— Select Block First —'}</option>
                  {availableCells.map(c => (
                    <option key={c.cell_id} value={c.cell_id}>
                      Cell #{c.cell_id} ({c.current_occupancy}/{c.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Assign Cell</button>
              <Link to={`/inmates/${id}`} className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
