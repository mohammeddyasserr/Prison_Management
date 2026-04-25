import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PublicVisitRequest.module.css';

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

export const PublicVisitRequest = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [context, setContext] = useState({
    loading: false,
    checkedId: '',
    inmate: null,
    slots: [],
    error: '',
  });
  const [submitState, setSubmitState] = useState({
    submitting: false,
    success: '',
    error: '',
  });

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (name === 'inmate_national_id') {
        next.time_slot = '';
        setContext({ loading: false, checkedId: '', inmate: null, slots: [], error: '' });
      }
      return next;
    });
  };

  const lookupInmate = async () => {
    const inmateNationalId = formData.inmate_national_id.trim();
    if (!inmateNationalId) {
      setContext({ loading: false, checkedId: '', inmate: null, slots: [], error: 'Enter the inmate National ID first.' });
      return false;
    }

    setContext((current) => ({ ...current, loading: true, error: '' }));

    try {
      const response = await fetch(`/api/visit-request/context?inmate_national_id=${encodeURIComponent(inmateNationalId)}`);
      const result = await response.json();

      if (result.success) {
        setContext({
          loading: false,
          checkedId: inmateNationalId,
          inmate: result.inmate,
          slots: result.slots || [],
          error: '',
        });
        return true;
      }

      setContext({
        loading: false,
        checkedId: inmateNationalId,
        inmate: null,
        slots: [],
        error: result.error || 'Unable to find the inmate.',
      });
      return false;
    } catch {
      setContext({
        loading: false,
        checkedId: inmateNationalId,
        inmate: null,
        slots: [],
        error: 'Unable to verify inmate details right now.',
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ submitting: true, success: '', error: '' });

    let canSubmit = true;
    if (context.checkedId !== formData.inmate_national_id.trim()) {
      canSubmit = await lookupInmate();
    }

    if (!canSubmit) {
      setSubmitState({ submitting: false, success: '', error: 'Please confirm a valid inmate before submitting.' });
      return;
    }

    try {
      const response = await fetch('/api/visit-request/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        setSubmitState({
          submitting: false,
          success: result.message,
          error: '',
        });
        setFormData(initialFormData);
        setContext({ loading: false, checkedId: '', inmate: null, slots: [], error: '' });
      } else {
        setSubmitState({
          submitting: false,
          success: '',
          error: result.error || 'Could not submit your visit request.',
        });
      }
    } catch {
      setSubmitState({
        submitting: false,
        success: '',
        error: 'Connection error. Please try again.',
      });
    }
  };

  const hasSlots = context.slots.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>CPMS — Visit Request</h1>
          <p>Submit a visit request to an inmate. No account is needed.</p>
        </div>

        {submitState.success && <div className={`${styles.alert} ${styles.success}`}>{submitState.success}</div>}
        {(submitState.error || context.error) && <div className={`${styles.alert} ${styles.error}`}>{submitState.error || context.error}</div>}

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
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
              <button type="button" className={`${styles.button} ${styles.primaryButton} ${styles.lookupButton}`} onClick={lookupInmate} disabled={context.loading}>
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
                  <strong>{context.inmate.prison_name || 'Assigned Prison'}</strong>
                </div>
              </div>
            )}

            <h3 className={styles.sectionTitle}>Your Information</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="visitor_name">Full Name *</label>
                <input id="visitor_name" name="visitor_name" type="text" value={formData.visitor_name} onChange={handleChange} className={styles.formControl} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="visitor_national_id">Your National ID *</label>
                <input id="visitor_national_id" name="visitor_national_id" type="text" value={formData.visitor_national_id} onChange={handleChange} className={styles.formControl} required />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="relationship">Relationship to Inmate *</label>
                <select id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} className={styles.formControl} required>
                  <option value="">— Select —</option>
                  {relationships.map((relationship) => (
                    <option key={relationship} value={relationship}>{relationship}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="visit_type">Visit Type</label>
                <select id="visit_type" name="visit_type" value={formData.visit_type} onChange={handleChange} className={styles.formControl}>
                  <option value="Regular">Regular Visit</option>
                  <option value="Legal">Legal Visit (Lawyer Consultation)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={styles.formControl} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={styles.formControl} />
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Schedule</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="visit_date">Preferred Date *</label>
                <input id="visit_date" name="visit_date" type="date" min={minDate} value={formData.visit_date} onChange={handleChange} className={styles.formControl} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="time_slot">Preferred Time Slot *</label>
                {hasSlots ? (
                  <select id="time_slot" name="time_slot" value={formData.time_slot} onChange={handleChange} className={styles.formControl} required>
                    <option value="">— Select an available slot —</option>
                    {context.slots.map((slot) => (
                      <option key={slot.slot_id} value={`${slot.start_time}-${slot.end_time}`}>
                        {slot.slot_label} ({slot.start_time}-{slot.end_time})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="time_slot"
                    name="time_slot"
                    type="text"
                    value={formData.time_slot}
                    onChange={handleChange}
                    className={styles.formControl}
                    placeholder="e.g. 09:00-10:00"
                    required
                  />
                )}
                <p className={styles.helperText}>
                  {hasSlots
                    ? 'Available slots are shown for the inmate prison.'
                    : 'If no slots appear, enter your preferred time manually like the original portal.'}
                </p>
              </div>
            </div>

            <button type="submit" className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`} disabled={submitState.submitting}>
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
