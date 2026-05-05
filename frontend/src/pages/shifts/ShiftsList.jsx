import React, { useEffect, useState } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import styles from '../EntityStyles.module.css';
import { hasRole } from '../../services/authentication';
import { postForm } from '../../services/authentication';
import { getShifts, getOfficers, getBlocks, getPrisons } from '../../data/mockData';

export const ShiftsList = () => {
  const [data, setData] = useState({ shifts: [], officers: [], blocks: [] });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    officer_id: '',
    block_id: '',
    shift_type: 'Morning',
    date: '',
  });

  useEffect(() => {
    const shifts = getShifts();
    const officers = getOfficers();
    const blocks = getBlocks();
    const prisons = getPrisons();

    const enrichedShifts = shifts.map(s => {
      const block = blocks.find(b => b.block_id === s.block_id);
      const prison = block ? prisons.find(p => p.prison_id === block.prison_id) : null;
      return {
        ...s,
        officer_name: officers.find(o => o.national_id === s.officer_id)?.name || '—',
        block_name: block?.name || '—',
        prison_name: prison?.name || '—',
      };
    });

    setData({
      shifts: enrichedShifts,
      officers: officers,
      blocks: blocks,
    });
    setLoading(false);
  }, []);
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Shift Schedule...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm('/shifts/add', formData);
    window.location.reload();
  };

  const removeShift = async (shiftId) => {
    await postForm(`/shifts/${shiftId}/delete`, {});
    setData((current) => ({
      ...current,
      shifts: current.shifts.filter((shift) => shift.shift_id !== shiftId),
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Shift Management</h1>

      {hasRole('prison_manager') && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px', maxWidth: '100%' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Assign Shift</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Officer *</label>
              <select name="officer_id" value={formData.officer_id} onChange={handleChange} style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} required>
                <option value="">— Select —</option>
                {data.officers.map(o => <option key={o.national_id} value={o.national_id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Block *</label>
              <select name="block_id" value={formData.block_id} onChange={handleChange} style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} required>
                <option value="">— Select —</option>
                {data.blocks.map(b => <option key={b.block_id} value={b.block_id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Shift Type *</label>
              <select name="shift_type" value={formData.shift_type} onChange={handleChange} style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} required>
                <option value="Morning">Morning (06:00–14:00)</option>
                <option value="Afternoon">Afternoon (14:00–22:00)</option>
                <option value="Night">Night (22:00–06:00)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', justifyContent: 'center' }}>Assign Shift</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="var(--color-primary)" /> Shift Schedule
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                {!hasRole('officer') && <th>Officer</th>}
                <th>Block</th>
                {hasRole('super_admin') && <th>Prison</th>}
                <th>Shift</th>
                <th>Date</th>
                <th>Time</th>
                {hasRole('prison_manager') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.shifts.length > 0 ? data.shifts.map((s) => (
                <tr key={s.shift_id}>
                  <td>{s.shift_id}</td>
                  {!hasRole('officer') && <td>{s.officer_name || '—'}</td>}
                  <td>{s.block_name}</td>
                  {hasRole('super_admin') && <td>{s.prison_name || '—'}</td>}
                  <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{s.shift_type}</span></td>
                  <td>{s.date}</td>
                  <td>{s.start_time} — {s.end_time}</td>
                  {hasRole('prison_manager') && (
                    <td className={styles.actions}>
                      <button className={`${styles.btn} ${styles.badgeDanger}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => removeShift(s.shift_id)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={hasRole('prison_manager') ? '7' : hasRole('super_admin') ? '7' : '5'} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No shifts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
