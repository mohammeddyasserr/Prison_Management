import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Shield, Info, Layers, Plus } from 'lucide-react';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../lib/auth';
import { postForm } from '../../lib/http';

export const PrisonDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockForm, setBlockForm] = useState({
    name: '',
    capacity: '',
    security_level: 'Maximum',
  });
  const [cellCapacityByBlock, setCellCapacityByBlock] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/prisons/api/detail/${id}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch prison details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Prison Details...</div>;
  if (!data || data.error) return <div style={{padding: '40px', textAlign: 'center'}}>Prison not found.</div>;

  const { prison, features, blocks, block_cells } = data;

  const addCell = async (blockId) => {
    const capacity = cellCapacityByBlock[blockId];
    if (!capacity) return;
    await postForm(`/prisons/${id}/blocks/${blockId}/cells/add`, { capacity });
    window.location.reload();
  };

  const addBlock = async (e) => {
    e.preventDefault();
    await postForm(`/prisons/${id}/blocks/add`, blockForm);
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{prison.name}</h1>
        {hasRole('super_admin') && (
          <Link to={`/prisons/${id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
            Edit Prison
          </Link>
        )}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px'}}>
        <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px'}}>
          <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Info size={20} color="var(--color-primary)" /> Facility Information
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <div><span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Location:</span><br/>{prison.location}</div>
            <div><span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Type:</span><br/>{prison.type}</div>
            <div><span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Security:</span><br/>{prison.security_level}</div>
            <div><span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Capacity:</span><br/>{prison.current_occupancy} / {prison.total_capacity}</div>
            <div style={{gridColumn: 'span 2'}}><span style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Manager:</span><br/>{prison.manager_name || 'Not assigned'}</div>
          </div>
        </div>

        {features && (
          <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px'}}>
            <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Layers size={20} color="var(--color-success)" /> Facility Features
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div>🏥 Infirmary: {features.infirmary ? '✅ Yes' : '❌ No'}</div>
              <div>🔧 Workshops: {features.workshops ? '✅ Yes' : '❌ No'}</div>
              <div>🌾 Agricultural: {features.agricultural_ward ? '✅ Yes' : '❌ No'}</div>
              <div style={{gridColumn: 'span 2'}}>👥 Visitation: {features.visitation_hall ? `✅ Yes (${features.visitation_hall_capacity})` : '❌ No'}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px'}}>
        <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Shield size={20} color="var(--color-warning)" /> Blocks & Cells
        </h2>

        {blocks.length > 0 ? blocks.map((block) => (
          <div key={block.block_id} style={{border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <h3 style={{fontSize: '1rem', fontWeight: 600}}>{block.name} — {block.security_level}</h3>
              <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                {block.current_occupancy}/{block.capacity} inmates | {block.number_of_cells} cells
              </span>
            </div>

            {block_cells[block.block_id] && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>Cell ID</th><th>Occupancy</th><th>Capacity</th><th>Status</th></tr></thead>
                  <tbody>
                    {block_cells[block.block_id].map((cell) => (
                      <tr key={cell.cell_id}>
                        <td>Cell #{cell.cell_id}</td>
                        <td>{cell.current_occupancy}</td>
                        <td>{cell.capacity}</td>
                        <td>
                          <span className={`${styles.badge} ${cell.current_occupancy >= cell.capacity ? styles.badgeDanger : cell.current_occupancy > 0 ? styles.badgeWarning : styles.badgeSuccess}`}>
                            {cell.current_occupancy >= cell.capacity ? 'Full' : cell.current_occupancy > 0 ? 'Occupied' : 'Empty'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {hasRole('super_admin', 'prison_manager') && (
              <div style={{marginTop: '12px', display: 'flex', gap: '8px'}}>
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
                  style={{padding: '6px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', width: '160px', color: 'var(--text-primary)'}}
                />
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => addCell(block.block_id)}>+ Add Cell</button>
              </div>
            )}
          </div>
        )) : (
          <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '20px'}}>No blocks created yet.</p>
        )}

        {hasRole('super_admin', 'prison_manager') && (
          <div style={{marginTop: '24px', borderTop: '1px dashed var(--border-color)', paddingTop: '20px'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '16px'}}>Add New Block</h3>
            <form onSubmit={addBlock} style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'flex-end'}}>
              <div>
                <label style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Block Name</label>
                <input type="text" value={blockForm.name} onChange={(e) => setBlockForm((current) => ({ ...current, name: e.target.value }))} placeholder="e.g. Block A" style={{width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)'}} required />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Capacity</label>
                <input type="number" value={blockForm.capacity} onChange={(e) => setBlockForm((current) => ({ ...current, capacity: e.target.value }))} style={{width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)'}} required />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Security Level</label>
                <select value={blockForm.security_level} onChange={(e) => setBlockForm((current) => ({ ...current, security_level: e.target.value }))} style={{width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)'}}>
                  <option>Maximum</option><option>Medium</option><option>Minimum</option><option>High</option>
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
