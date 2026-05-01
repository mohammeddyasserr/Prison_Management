import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PublicVisitRequest.module.css';
import { getInmates, getPrisons } from '../../data/mockData';

const initialFormData = {
  inmate_national_id: '',
  visitor_name: '',
  visitor_national_id: '',
  relationship: '',
  visit_type: 'Regular',
  phone: '',
  email: '',
  visit_date: '',
  time_slot: '',
};

const relationships = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Lawyer', 'Other'];

const TIME_SLOTS = [
  { value: '09:00-10:00', label: '9:00 AM – 10:00 AM' },
  { value: '10:00-11:00', label: '10:00 AM – 11:00 AM' },
  { value: '11:00-12:00', label: '11:00 AM – 12:00 PM' },
  { value: '12:00-13:00', label: '12:00 PM – 1:00 PM' },
  { value: '13:00-14:00', label: '1:00 PM – 2:00 PM' },
  { value: '14:00-15:00', label: '2:00 PM – 3:00 PM' },
];

const getUpcomingDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 5 && date.getDay() !== 6) {
      days.push(date.toISOString().split('T')[0]);
    }
  }
  return days;
};

export const PublicVisitRequest = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [context, setContext] = useState({
    loading: false,
    checkedId: '',
    inmate: null,
    error: '',
  });
  const [submitState, setSubmitState] = useState({
    submitting: false,
    success: '',
    error: '',
  });

  const upcomingDays = useMemo(() => getUpcomingDays(), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (name === 'inmate_national_id') {
        next.time_slot = '';
        setContext({ loading: false, checkedId: '', inmate: null, error: '' });
      }
      return next;
    });
  };

  const lookupInmate = () => {
    const inmateNationalId = formData.inmate_national_id.trim();
    if (!inmateNationalId) {
      setContext({ loading: false, checkedId: '', inmate: null, error: 'Enter the inmate National ID first.' });
      return false;
    }

    setContext((current) => ({ ...current, loading: true, error: '' }));

    const inmates = getInmates();
    const prisons = getPrisons();
    const found = inmates.find(i => i.national_id === inmateNationalId);

    if (found) {
      const prison = prisons.find(p => p.prison_id === found.assigned_prison);
      setContext({
        loading: false,
        checkedId: inmateNationalId,
        inmate: { ...found, prison_name: prison?.name || '—' },
        error: '',
      });
      return true;
    }

    setContext({
      loading: false,
      checkedId: inmateNationalId,
      inmate: null,
      error: 'Unable to find the inmate with this National ID.',
    });
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitState({ submitting: true, success: '', error: '' });

    let canSubmit = true;
    if (context.checkedId !== formData.inmate_national_id.trim()) {
      canSubmit = lookupInmate();
    }

    if (!canSubmit) {
      setSubmitState({ submitting: false, success: '', error: 'Please confirm a valid inmate before submitting.' });
      return;
    }

    // Simulate successful submission with mock data
    setTimeout(() => {
      setSubmitState({
        submitting: false,
        success: 'Your visit request has been submitted successfully. You will be notified once it is reviewed.',
        error: '',
      });
      setFormData(initialFormData);
      setContext({ loading: false, checkedId: '', inmate: null, error: '' });
    }, 500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>CPMS — Visit Request</h1>
          <p>Submit a visit request to an inmate. No account is needed.</p>
        </div>

        {submitState.success && (
          <div className={`${styles.alert} ${styles.success}`}>{submitState.success}</div>
        )}
        {(submitState.error || context.error) && (
          <div className={`${styles.alert} ${styles.error}`}>{submitState.error || context.error}</div>
        )}

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Inmate Information */}
            <h3 className={styles.sectionTitle}>Inmate Information</h3>
            <div className={styles.lookupRow}>
              <div className={styles.formGroup}>
                <label htmlFor="inmate_national_id">Inmate National ID *</label>
                <input
                  id="inmate_national_id"
                  name="inmate_national_id"
                  type="text"
                  value={formData.inmate_national_id}
                  onChange={handleChange}
                  className={styles.formControl}
                  placeholder="Enter the inmate's National ID"
                  required
                />
              </div>
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton} ${styles.lookupButton}`}
                onClick={lookupInmate}
                disabled={context.loading}
              >
                {context.loading ? 'Checking...' : 'Check Inmate'}
              </button>
            </div>

            {context.inmate && (
              <div className={styles.contextCard}>
                <div>
                  <span className={styles.contextLabel}>Inmate</span>
                  <strong>{context.inmate.full_name}</strong>
                </div>
                <div>
                  <span className={styles.contextLabel}>Prison</span>
                  <strong>{context.inmate.prison_name}</strong>
                </div>
              </div>
            )}

            {/* Visitor Information */}
            <h3 className={styles.sectionTitle}>Your Information</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="visitor_name">Full Name *</label>
                <input
                  id="visitor_name"
                  name="visitor_name"
                  type="text"
                  value={formData.visitor_name}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="visitor_national_id">Your National ID *</label>
                <input
                  id="visitor_national_id"
                  name="visitor_national_id"
                  type="text"
                  value={formData.visitor_national_id}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="relationship">Relationship to Inmate *</label>
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                >
                  <option value="">— Select —</option>
                  {relationships.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="visit_type">Visit Type</label>
                <select
                  id="visit_type"
                  name="visit_type"
                  value={formData.visit_type}
                  onChange={handleChange}
                  className={styles.formControl}
                >
                  <option value="Regular">Regular Visit</option>
                  <option value="Legal">Legal Visit (Lawyer Consultation)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.formControl}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.formControl}
                />
              </div>
            </div>

            {/* Schedule */}
            <h3 className={styles.sectionTitle}>Schedule</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="visit_date">Preferred Date *</label>
                <select
                  id="visit_date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                >
                  <option value="">— Select a date —</option>
                  {upcomingDays.map(date => (
                    <option key={date} value={date}>
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="time_slot">Preferred Time Slot *</label>
                <select
                  id="time_slot"
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                >
                  <option value="">— Select a time slot —</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <p className={styles.helperText}>
                  Visiting hours: 9:00 AM – 3:00 PM. Max 10 visitors per slot.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`}
              disabled={submitState.submitting}
            >
              {submitState.submitting ? 'Submitting...' : 'Submit Visit Request'}
            </button>
          </form>
        </div>

        <div className={styles.footerLink}>
          <Link to="/login">← Staff Login</Link>
        </div>
      </div>
    </div>
  );
};