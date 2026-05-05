import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Shield, Info, Layers, Plus } from 'lucide-react';
import styles from '../EntityStyles.module.css';
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Prison Details...</div>;
  const { prison, blocks } = data;
  if (!prison) return <div style={{ padding: '40px', textAlign: 'center' }}>Prison not found.</div>;

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{prison.name}</h1>
        {hasRole('admin') && (
          <Link to={`/prisons/${id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
            Edit Prison
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} color="var(--color-primary)" /> Facility Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Location:</span><br />{prison.location}</div>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Type:</span><br />{prison.type}</div>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Security:</span><br />{prison.security_level}</div>
            <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Capacity:</span><br />{prison.current_occupancy} / {prison.total_capacity}</div>
            <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Manager:</span><br />{prison.manager_name || 'Not assigned'}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--color-success)" /> Facility Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>🏥 Infirmary: {prison.has_hospital ? '✅ Yes' : '❌ No'}</div>
              <div>🔧 Workshops: {prison.has_workshops ? '✅ Yes' : '❌ No'}</div>
              <div>🌾 Agricultural: {prison.has_agricultural_ward ? '✅ Yes' : '❌ No'}</div>
              <div style={{ gridColumn: 'span 2' }}>👥 Visitation: {prison.has_visitation_hall ? `✅ Yes (${prison.visitation_hall_capacity})` : '❌ No'}</div>
            </div>
          </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} color="var(--color-warning)" /> Blocks & Cells
        </h2>

        {blocks.length > 0 ? blocks.map((block) => (
          <div key={block.block_id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Block {block.block_id} — {block.security_level}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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

            {hasRole('admin', 'prison_manager') && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
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
                  style={{ padding: '6px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', width: '160px', color: 'var(--text-primary)' }}
                />
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => addCell(block.block_id)}>+ Add Cell</button>
              </div>
            )}
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No blocks created yet.</p>
        )}

        {hasRole('admin', 'prison_manager') && (
          <div style={{ marginTop: '24px', borderTop: '1px dashed var(--border-color)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Add New Block</h3>
            <form onSubmit={addBlock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Security Level</label>
                <select value={blockForm.security_level} onChange={(e) => setBlockForm((current) => ({ ...current, security_level: e.target.value }))} style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>+ Add Block</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
