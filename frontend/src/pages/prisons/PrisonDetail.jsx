import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Shield, Info, Layers, Plus } from 'lucide-react';
import styles from '../PrisonStyles.module.css';
import { hasRole, postForm } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const PrisonDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState({ prison: null, blocks: [] });
  const [loading, setLoading] = useState(true);
  const [blockForm, setBlockForm] = useState({ security_level: 'High' });
  const [cellCapacityByBlock, setCellCapacityByBlock] = useState({});
  const toast = useToast();

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`/api/prison/${id}`).then(r => r.json()),
      fetch(`/api/prison/${id}/blocks-cells`).then(r => r.json()),
    ]).then(([prisonData, blocksData]) => {
      setData({ prison: prisonData, blocks: blocksData });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className={styles.emptyState}>Loading Prison Details...</div>;
  const { prison, blocks } = data;
  if (!prison) return <div className={styles.emptyState}>Prison not found.</div>;

  const addCell = async (blockId) => {
    const capacity = cellCapacityByBlock[blockId];
    if (!capacity) {
      toast.warning('Input Required', 'Please specify the capacity for the new cell.');
      return;
    }
    try {
      await fetch(`/api/cell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_id: blockId, capacity: parseInt(capacity) }),
      });
      fetchData();
      toast.success('Cell Added', 'New cell has been added to the block.');
    } catch (err) {
      toast.error('Operation Failed', 'Could not add new cell.');
    }
  };

  const addBlock = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prison_id: parseInt(id), security_level: blockForm.security_level }),
      });
      fetchData();
      toast.success('Block Added', 'A new block has been added to the facility.');
    } catch (err) {
      toast.error('Operation Failed', 'Could not create a new block.');
    }
  };

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
          <h1 className={styles.prisonTitle}>{prison.name}</h1>
          {hasRole('admin') && (
            <Link to={`/prisons/${id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
              Edit Prison
            </Link>
          )}
        </header>

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}><Info size={16} style={{ marginRight: '6px' }} /> Facility Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '14px 0', borderBottom: '1px solid rgba(120, 0, 0, 0.15)' }}>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Location:</span><br /><strong>{prison.location}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Type:</span><br /><strong>{prison.type}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Security:</span><br /><strong>{prison.security_level}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Capacity:</span><br /><strong>{prison.current_occupancy} / {prison.total_capacity}</strong></div>
            <div><span style={{ color: '#7a6a58', fontSize: '0.7rem', textTransform: 'uppercase' }}>Manager:</span><br /><strong>{prison.manager_name || 'Not assigned'}</strong></div>
          </div>
          <div style={{ paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Layers size={14} color="#5a4a3a" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5a4a3a', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>Facility Features</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Infirmary</span>
                <span className={`${styles.featureBadge} ${prison.has_hospital ? styles.featureOn : styles.featureOff}`}>
                  {prison.has_hospital ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Workshops</span>
                <span className={`${styles.featureBadge} ${prison.has_workshops ? styles.featureOn : styles.featureOff}`}>
                  {prison.has_workshops ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Agricultural</span>
                <span className={`${styles.featureBadge} ${prison.has_agricultural_ward ? styles.featureOn : styles.featureOff}`}>
                  {prison.has_agricultural_ward ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Visitation</span>
                <span className={`${styles.featureBadge} ${prison.has_visitation_hall ? styles.featureOn : styles.featureOff}`}>
                  {prison.has_visitation_hall ? `Yes (${prison.visitation_hall_capacity})` : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ledger}>
          <div className={styles.ledgerTitle}>Blocks & Cells</div>

          {blocks.length > 0 ? blocks.map((block) => (
            <div key={block.block_id} style={{ borderTop: '1px solid rgba(120, 0, 0, 0.25)', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2c1a0e' }}>Block {block.block_id} — {block.security_level}</h3>
                <span style={{ fontSize: '0.75rem', color: '#7a6a58' }}>
                  {block.total_inmates} inmates | {block.total_cells} cells
                </span>
              </div>

              {block.cells && block.cells.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead><tr><th>Cell ID</th><th>Occupancy</th><th>Capacity</th><th>Status</th></tr></thead>
                    <tbody>
                      {block.cells.map((cell) => (
                        <tr key={cell.cell_id}>
                          <td>Cell #{cell.cell_id}</td>
                          <td>{cell.occupancy}</td>
                          <td>{cell.capacity}</td>
                          <td>
                            <span className={`${styles.badge} ${cell.status === 'Full' ? styles.badgeDanger : cell.status === 'Occupied' ? styles.badgeWarning : styles.badgeSuccess}`}>
                              {cell.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {hasRole('admin', 'manager') && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    placeholder="Cell capacity"
                    value={cellCapacityByBlock[block.block_id] || ''}
                    onChange={(e) =>
                      setCellCapacityByBlock((current) => ({
                        ...current,
                        [block.block_id]: e.target.value,
                      }))
                    }
                    className={styles.formInput}
                    style={{ width: '160px', flex: 'none' }}
                  />
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => addCell(block.block_id)}>+ Add Cell</button>
                </div>
              )}
            </div>
          )) : (
            <p className={styles.emptyState}>No blocks created yet.</p>
          )}

          {hasRole('admin', 'manager') && (
            <div style={{ borderTop: '2px solid rgba(120, 0, 0, 0.25)', marginTop: '20px', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#5a4a3a', marginBottom: '16px', textTransform: 'uppercase' }}>Add New Block</h3>
              <form onSubmit={addBlock} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#6a5742', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase' }}>Security Level</label>
                  <select 
                    value={blockForm.security_level} 
                    onChange={(e) => setBlockForm((current) => ({ ...current, security_level: e.target.value }))}
                    className={styles.formSelect}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>+ Add Block</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
