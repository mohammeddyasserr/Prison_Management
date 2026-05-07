import React, { useEffect, useState } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import styles from '../PrisonStyles.module.css';
import { hasRole } from '../../services/authentication';
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
    const fetchData = async () => {
      try {
        const prisonId = localStorage.getItem('prison_id');
        const [shifts, officers, allPrisons] = await Promise.all([
          hasRole('admin') || hasRole('manager')
            ? prisonId
              ? fetch(`/api/shift/prison/${prisonId}`).then(r => r.json())
              : fetch('/api/shift').then(r => r.json())
            : fetch(`/api/shift/officer/${localStorage.getItem('userNationalId')}`).then(r => r.json()),
          fetch('/api/staff/officers').then(r => r.json()),
          fetch('/api/prison').then(r => r.json()),
        ]);

        // Filter prisons to only show relevant ones based on role
        const prisons = hasRole('admin')
          ? allPrisons
          : prisonId
            ? allPrisons.filter(p => p.prison_id == prisonId)
            : [];

        const allBlocks = await Promise.all(
          prisons.map(p => fetch(`/api/block/prison/${p.prison_id}`).then(r => r.json()))
        );

        const flattenedBlocks = allBlocks.flat().map(b => ({
          block_id: b.block_id,
          name: `Block ${b.block_id} (${b.security_level})`
        }));

        setData({ shifts, officers, blocks: flattenedBlocks });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) return <div className={styles.emptyState}>Loading Shift Schedule...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        block_id: parseInt(formData.block_id, 10),
        manager_id: localStorage.getItem('userNationalId') || 'System'
      };

      const response = await fetch('/api/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Assignment Failed');
      }

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
      toast.error('Assignment Failed', err.message || 'There was an error assigning the shift.');
    }
  };

  const removeShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to remove this shift assignment?')) return;
    try {
      const response = await fetch(`/api/shift/${shiftId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

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
      <div className={styles.prisonContent}>
        <div className={styles.prisonHeader}>
          <h1 className={styles.prisonTitle}>Shift Management</h1>
          <p className={styles.prisonSubtitle}>Assign and manage officer shifts</p>
        </div>

{hasRole('manager') && (
           <div className={styles.formCard} style={{ marginBottom: '22px' }}>
            <div className={styles.formSection}>
              <p className={styles.formSectionTitle}>Assign Shift</p>
              <form onSubmit={handleSubmit} className={styles.prisonForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Officer *</label>
                    <select name="officer_id" value={formData.officer_id} onChange={handleChange} className={styles.formInput} required>
                      <option value="">— Select —</option>
                      {data.officers.map(o => <option key={o.national_id} value={o.national_id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Block *</label>
                    <select name="block_id" value={formData.block_id} onChange={handleChange} className={styles.formInput} required>
                      <option value="">— Select —</option>
                      {data.blocks.map(b => <option key={b.block_id} value={b.block_id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Shift Type *</label>
                    <select name="shift_type" value={formData.shift_type} onChange={handleChange} className={styles.formInput} required>
                      <option value="Morning">Morning (06:00–14:00)</option>
                      <option value="Afternoon">Afternoon (14:00–22:00)</option>
                      <option value="Night">Night (22:00–06:00)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className={styles.formInput} required />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Assign Shift</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={styles.ledger}>
          <div className={styles.ledgerPinLeft} />
          <div className={styles.ledgerPinRight} />
          <p className={styles.ledgerTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#7a0000" /> Shift Schedule
          </p>
<div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Officer</th>
                    {hasRole('admin') && <th>Prison</th>}
                    <th>Block</th>
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
                      <td>{s.officer_name || '—'}</td>
                      {hasRole('admin') && <td>{s.prison_name || '—'}</td>}
                      <td>Block {s.block_id}</td>
                      <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{s.shift_type}</span></td>
                      <td>{s.date}</td>
                      <td>{s.time_range}</td>
                      {hasRole('manager') && (
                        <td className={styles.actions}>
                          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => removeShift(s.shift_id)}>
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr><td colSpan={hasRole('manager') ? (hasRole('admin') ? '8' : '7') : (hasRole('admin') ? '7' : '6')} style={{ textAlign: 'center', padding: '20px', color: '#7a6a58' }}>No shifts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
  );
};
