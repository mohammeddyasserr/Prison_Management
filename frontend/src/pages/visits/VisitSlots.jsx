import React, { useEffect, useState } from 'react';
import { Trash2, Clock } from 'lucide-react';
import styles from '../EntityStyles.module.css';

export const VisitSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetch('/api/visit/timeslots', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(r => r.json())
      .then(data => { setSlots(data); setLoading(false); })
      .catch((error) => { console.error("Error fetching slots:", error); setLoading(false); });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/visit/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const newSlot = await response.json();
        setSlots([...slots, newSlot]);
        setFormData({ date: '', start_time: '', end_time: '' });
      } else {
        console.error("Failed to add slot");
      }
    } catch (error) {
      console.error("Error adding slot:", error);
    }
  };

  const deleteSlot = async (slotId) => {
    try {
      const response = await fetch(`/api/visit/timeslots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setSlots((current) => current.filter((slot) => slot.slot_id !== slotId));
      } else {
        console.error("Failed to delete slot");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Time Slots...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visit Time Slots</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', marginBottom: '24px', maxWidth: '100%' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Add Time Slot</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className={styles.formControl} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>Start Time</label>
            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required className={styles.formControl} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>End Time</label>
            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required className={styles.formControl} />
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Add Slot</button>
        </form>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="var(--color-primary)" /> Current Time Slots
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>Date</th><th>Start Time</th><th>End Time</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {slots.length > 0 ? slots.map((slot) => (
                <tr key={slot.slot_id}>
                  <td>{slot.date}</td>
                  <td>{slot.start_time}</td>
                  <td>{slot.end_time}</td>
                  <td className={styles.actions}>
                    <button
                      className={`${styles.btn} ${styles.badgeDanger}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => deleteSlot(slot.slot_id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No time slots defined.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
