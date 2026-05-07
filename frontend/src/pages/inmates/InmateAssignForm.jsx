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
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // This screen is used to place a pending inmate into a real cell.
        // Try pending inmate first; fall back to inmate if needed.
        let person = await fetch(`/api/pending_inmates/${id}`).then(async (r) => {
          if (!r.ok) throw new Error('not_pending');
          return r.json();
        });

        if (!person || person.error) {
          person = await fetch(`/api/inmates/${id}`).then(r => r.json());
        }

        const prisonId = person?.assigned_prison;

        if (!prisonId) {
          if (!cancelled) {
            setData({ inmate: person, blocks: [], blockCells: {}, isPending: Boolean(person?.pending_inmate_id) });
            setLoading(false);
          }
          return;
        }

        const blocks = await fetch(`/api/prison/${prisonId}/blocks-cells`).then(r => r.json());
        const blockCells = Object.fromEntries(
          (Array.isArray(blocks) ? blocks : []).map(b => [String(b.block_id), b.cells ?? []])
        );

        if (!cancelled) {
          setData({
            inmate: person,
            blocks: Array.isArray(blocks) ? blocks : [],
            blockCells,
            isPending: Boolean(person?.pending_inmate_id),
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
    setSubmitError('');

    try {
      const body = new URLSearchParams();
      body.append('cell_id', formData.cell_id ?? '');

      const response = await fetch(`/api/pending_inmates/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setSubmitError(err?.detail || 'Failed to assign inmate to this cell.');
        return;
      }

      navigate(`/inmates/${id}`);
    } catch {
      setSubmitError('Failed to assign inmate to this cell.');
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;
  if (!data || data.error) return <div className={styles.emptyState}>Inmate not found.</div>;

  const { inmate, blocks, blockCells } = data;
  const availableCells = formData.block_id ? (blockCells[String(formData.block_id)] || []) : [];

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
                      Block #{b.block_id} ({b.security_level}) — {b.total_inmates} inmates / {b.total_cells} cells
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
                      Cell #{c.cell_id} ({c.occupancy}/{c.capacity}) — {c.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Assign Cell</button>
              <Link to={`/inmates/${id}`} className={`${styles.btn} ${styles.btnOutline}`}>Cancel</Link>
            </div>
            {submitError && (
              <div style={{ marginTop: '10px', color: '#b42318', fontSize: '0.85rem' }}>
                {submitError}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
