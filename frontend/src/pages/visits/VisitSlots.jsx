import React, { useEffect, useState } from 'react';
import { Trash2, Clock } from 'lucide-react';
import styles from '../PrisonStyles.module.css';

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

  if (loading) return <div className={styles.emptyState}>Loading Time Slots...</div>;

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
           <h1 className={styles.prisonTitle}>Visit Time Slots</h1>
         </header>

         <div className={styles.ledger}>
           <div className={styles.ledgerTitle}><Clock size={16} style={{ marginRight: '6px' }} /> Manage Time Slots</div>

           <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.08)', borderRadius: '8px' }}>
             <div className={styles.formRow}>
               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Date</label>
                 <input 
                   type="date" 
                   name="date" 
                   value={formData.date} 
                   onChange={handleChange} 
                   required 
                   className={styles.formInput}
                 />
               </div>
               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Start Time</label>
                 <input 
                   type="time" 
                   name="start_time" 
                   value={formData.start_time} 
                   onChange={handleChange} 
                   required 
                   className={styles.formInput}
                 />
               </div>
               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>End Time</label>
                 <input 
                   type="time" 
                   name="end_time" 
                   value={formData.end_time} 
                   onChange={handleChange} 
                   required 
                   className={styles.formInput}
                 />
               </div>
             </div>
             <div className={styles.formActions} style={{ marginTop: '12px' }}>
               <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Add Slot</button>
             </div>
           </form>

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
                         style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}
                         onClick={() => deleteSlot(slot.slot_id)}
                       >
                         <Trash2 size={14} /> Delete
                       </button>
                     </td>
                   </tr>
                 )) : (
                   <tr><td colSpan="4" className={styles.emptyState}>No time slots defined.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
       </div>
     </div>
   );
};
