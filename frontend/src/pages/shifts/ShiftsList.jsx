import React, { useEffect, useState } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import styles from '../PrisonStyles.module.css';
import { hasRole, postForm } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const ShiftsList = () => {
  const [data, setData] = useState({ shifts: [], officers: [], blocks: [] });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [formData, setFormData] = useState({
    officer_id: '',
    block_id: '',
    shift_type: 'Morning',
    date: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/shift').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
    ]).then(([shifts, officers]) => {
      // Extract unique blocks from shifts for the dropdown
      const blocksMap = {};
      shifts.forEach(s => {
        if (s.block_id) blocksMap[s.block_id] = { block_id: s.block_id, name: s.block_name || `Block ${s.block_id}` };
      });
      setData({ shifts, officers, blocks: Object.values(blocksMap) });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Shift Schedule...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postForm('/shifts/add', formData);
      const newShift = await response.json();
      
      setData(prev => ({
        ...prev,
        shifts: [newShift, ...prev.shifts]
      }));
      
      setFormData({
        officer_id: '',
        block_id: '',
        shift_type: 'Morning',
        date: '',
      });
      
      toast.success('Shift Assigned', 'The shift has been successfully assigned to the officer.');
    } catch (err) {
      toast.error('Assignment Failed', 'There was an error assigning the shift. Please try again.');
    }
  };

  const removeShift = async (shiftId) => {
    try {
      await postForm(`/shifts/${shiftId}/delete`, {});
      setData((current) => ({
        ...current,
        shifts: current.shifts.filter((shift) => shift.shift_id !== shiftId),
      }));
      toast.success('Shift Removed', 'The shift assignment has been removed.');
    } catch (err) {
      toast.error('Removal Failed', 'Could not remove the shift assignment.');
    }
  };

  return (
    <div className={styles.prisonContainer}>
      <div className={styles.prisonHeader}>
        <h1 className={styles.prisonTitle}>Shift Management</h1>
        <p className={styles.prisonSubtitle}>Assign and manage officer shifts</p>
      </div>

      {hasRole('manager') && (
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
                {hasRole('admin') && <th>Prison</th>}
                <th>Shift</th>
                <th>Date</th>
                <th>Time</th>
                {hasRole('manager') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.shifts.length > 0 ? data.shifts.map((s) => (
                <tr key={s.shift_id}>
                  <td>{s.shift_id}</td>
                  {!hasRole('officer') && <td>{s.officer_name || '—'}</td>}
                  <td>{s.block_name}</td>
                  {hasRole('admin') && <td>{s.prison_name || '—'}</td>}
                  <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{s.shift_type}</span></td>
                  <td>{s.date}</td>
                  <td>{s.start_time} — {s.end_time}</td>
                  {hasRole('manager') && (
                    <td className={styles.actions}>
                      <button className={`${styles.btn} ${styles.badgeDanger}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => removeShift(s.shift_id)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={hasRole('manager') ? '7' : hasRole('admin') ? '7' : '5'} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No shifts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
