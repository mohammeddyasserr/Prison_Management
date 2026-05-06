import React, { useEffect, useState } from 'react';
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
};

const relationships = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Lawyer', 'Other'];

export const PublicVisitRequest = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [availableDates, setAvailableDates] = useState([]);
  const [context, setContext] = useState({
    loading: false,
    checkedId: '',
    inmate: null,
    error: '',
  });
  const [visitorContext, setVisitorContext] = useState({
    loading: false,
    checkedId: '',
    visitor: null, // null means not checked yet
    isNew: false,
    error: '',
  });
  const [submitState, setSubmitState] = useState({
    submitting: false,
    success: '',
    error: '',
  });

  useEffect(() => {
    fetch('/api/visit/timeslots/dates')
      .then(r => r.json())
      .then(data => setAvailableDates(data))
      .catch(err => console.error('Failed to load dates', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };

      // Reset dependent fields if parent IDs change
      if (name === 'inmate_national_id') {
        setContext({ loading: false, checkedId: '', inmate: null, error: '' });
        setVisitorContext({ loading: false, checkedId: '', visitor: null, isNew: false, error: '' });
        next.visit_date = '';
      }

      if (name === 'visitor_national_id') {
        setVisitorContext({ loading: false, checkedId: '', visitor: null, isNew: false, error: '' });
        next.visitor_name = '';
        next.phone = '';
        next.email = '';
        next.relationship = '';
        next.visit_date = '';
      }

      return next;
    });
  };

  const lookupInmate = async () => {
    const inmateNationalId = formData.inmate_national_id.trim();
    if (inmateNationalId.length !== 14) {
      setContext({ loading: false, checkedId: '', inmate: null, error: 'Inmate National ID must be exactly 14 characters.' });
      return false;
    }

    setContext((current) => ({ ...current, loading: true, error: '' }));

    try {
      const response = await fetch(`/api/inmates/national_id/${inmateNationalId}`);

      if (response.status === 404) {
        setContext({
          loading: false,
          checkedId: inmateNationalId,
          inmate: null,
          error: 'Unable to find the inmate with this National ID.',
        });
        return false;
      }

      if (!response.ok) throw new Error('Failed to fetch inmate');
      const found = await response.json();

      setContext({
        loading: false,
        checkedId: inmateNationalId,
        inmate: { ...found, prison_name: found.prison_name || '—' },
        error: '',
      });
      return true;
    } catch {
      setContext({
        loading: false,
        checkedId: inmateNationalId,
        inmate: null,
        error: 'Error connecting to the server. Please try again later.',
      });
      return false;
    }
  };

  const lookupVisitor = async () => {
    const visitorId = formData.visitor_national_id.trim();
    if (visitorId.length !== 14) {
      setVisitorContext({ ...visitorContext, error: 'Your National ID must be exactly 14 characters.' });
      return;
    }

    setVisitorContext({ ...visitorContext, loading: true, error: '' });

    try {
      const response = await fetch(`/api/visit/visitor/${visitorId}`);

      if (response.status === 404) {
        // Visitor not found, they are new
        setVisitorContext({
          loading: false,
          checkedId: visitorId,
          visitor: null,
          isNew: true,
          error: '',
        });
        // Ensure fields are clear for new registration
        setFormData(prev => ({
          ...prev,
          visitor_name: '',
          phone: '',
          email: '',
          relationship: ''
        }));
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch visitor');
      const found = await response.json();

      setVisitorContext({
        loading: false,
        checkedId: visitorId,
        visitor: found,
        isNew: false,
        error: '',
      });

      // Pre-fill form if visitor found
      setFormData(prev => ({
        ...prev,
        visitor_name: found.full_name,
        phone: found.phone || '',
        email: found.email || '',
        relationship: found.relationship || ''
      }));

    } catch {
      setVisitorContext({
        loading: false,
        checkedId: visitorId,
        visitor: null,
        isNew: false,
        error: 'Error checking visitor status. Please try again.',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ submitting: true, success: '', error: '' });

    try {
      let visitorId = formData.visitor_national_id;

      // 1. If visitor is new, create them first
      if (visitorContext.isNew) {
        const vResponse = await fetch('/api/visit/visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            national_id: formData.visitor_national_id,
            full_name: formData.visitor_name,
            relationship: formData.relationship,
            phone: formData.phone,
            email: formData.email
          })
        });

        if (!vResponse.ok) {
          const errData = await vResponse.json();
          throw new Error(errData.detail || 'Failed to register visitor information.');
        }
      }

      // 2. Create visit
      const visitData = {
        inmate_id: context.inmate.inmate_id,
        visitor_id: visitorId,
        visit_date: formData.visit_date,
        visit_type: formData.visit_type
      };

      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to submit visit request');
      }

      setSubmitState({
        submitting: false,
        success: 'Your visit request has been submitted successfully. You will be notified once it is reviewed.',
        error: '',
      });
      setFormData(initialFormData);
      setContext({ loading: false, checkedId: '', inmate: null, error: '' });
      setVisitorContext({ loading: false, checkedId: '', visitor: null, isNew: false, error: '' });

    } catch (err) {
      setSubmitState({
        submitting: false,
        success: '',
        error: err.message || 'Failed to submit visit request. Please try again.',
      });
    }
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
        {(submitState.error || context.error || visitorContext.error) && (
          <div className={`${styles.alert} ${styles.error}`}>
            {submitState.error || context.error || visitorContext.error}
          </div>
        )}

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Step 1: Inmate Information */}
            <h3 className={styles.sectionTitle}>1. Inmate Information</h3>
            <div className={styles.formGroup}>
              <label htmlFor="inmate_national_id">Inmate National ID *</label>
              <div className={styles.lookupInputWrapper}>
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
                <button
                  type="button"
                  className={`${styles.button} ${styles.primaryButton} ${styles.lookupButton}`}
                  onClick={lookupInmate}
                  disabled={context.loading}
                >
                  {context.loading ? 'Checking...' : 'Check'}
                </button>
              </div>
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

            {/* Step 2: Visitor Information - Shown only after inmate is checked */}
            {context.inmate && (
              <>
                <h3 className={styles.sectionTitle}>2. Your Information</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="visitor_national_id">Your National ID *</label>
                  <div className={styles.lookupInputWrapper}>
                    <input
                      id="visitor_national_id"
                      name="visitor_national_id"
                      type="text"
                      value={formData.visitor_national_id}
                      onChange={handleChange}
                      className={styles.formControl}
                      placeholder="Enter your National ID"
                      required
                    />
                    <button
                      type="button"
                      className={`${styles.button} ${styles.primaryButton} ${styles.lookupButton}`}
                      onClick={lookupVisitor}
                      disabled={visitorContext.loading}
                    >
                      {visitorContext.loading ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                </div>

                {visitorContext.visitor && (
                  <div className={`${styles.contextCard} ${styles.visitorCard}`}>
                    <div className={styles.contextGrid}>
                      <div>
                        <span className={styles.contextLabel}>Full Name</span>
                        <strong>{visitorContext.visitor.full_name}</strong>
                      </div>
                      <div>
                        <span className={styles.contextLabel}>Phone Number</span>
                        <strong>{visitorContext.visitor.phone}</strong>
                      </div>
                      <div>
                        <span className={styles.contextLabel}>Email Address</span>
                        <strong>{visitorContext.visitor.email || '—'}</strong>
                      </div>
                      <div>
                        <span className={styles.contextLabel}>Relationship</span>
                        <strong>{visitorContext.visitor.relationship}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {visitorContext.isNew && (
                  <div className={styles.newVisitorSection}>
                    <div className={styles.newVisitorBadge}>New Visitor</div>
                    <p className={styles.helperText}>No record found for this ID. Please provide your details for registration.</p>
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
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          id="phone"
                          name="phone"
                          type="text"
                          value={formData.phone}
                          onChange={handleChange}
                          className={styles.formControl}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address *</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.formControl}
                          required
                        />
                      </div>
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
                          <option value="">Select relationship</option>
                          {relationships.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Scheduling - Shown only after visitor is identified */}
            {context.inmate && (visitorContext.visitor || visitorContext.isNew) && (
              <>
                <h3 className={styles.sectionTitle}>3. Schedule Visit</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="visit_date">Visit Date *</label>
                  <select
                    id="visit_date"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleChange}
                    className={styles.formControl}
                    required
                  >
                    <option value="">Select a date</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </option>
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
                    <option value="Legal">Legal / Attorney Visit</option>
                    <option value="Special">Special Permission Visit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`}
                  disabled={submitState.submitting}
                >
                  {submitState.submitting ? 'Submitting Request...' : 'Submit Visit Request'}
                </button>
              </>
            )}
          </form>
        </div>

        <div className={styles.footerLink}>
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Officer Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
};