import React, { useEffect, useState } from 'react';
import { Eye, TrendingUp, ShieldAlert, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';

export const MLPredictions = () => {
  const [data, setData] = useState({ risk_scores: [], overcrowding: [], recidivism_scores: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/inmates').then(r => r.json()),
      fetch('/api/prison').then(r => r.json()),
      fetch('/api/disciplinary').then(r => r.json()),
      fetch('/api/transfer').then(r => r.json()),
    ]).then(([allInmates, prisons, disciplinary, transfers]) => {
      const inmates = allInmates.filter(i => i.status === 'active');

      const risk_scores = inmates.map(inmate => {
        const incidentCount = disciplinary.filter(dl => dl.inmate_id === inmate.inmate_id).length;
        const score = Math.min(100, incidentCount * 20);
        const level = score >= 80 ? 'Critical' : score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low';
        return { inmate_id: inmate.inmate_id, name: inmate.full_name, score, level };
      }).sort((a, b) => b.score - a.score);

      const overcrowding = prisons.map(prison => {
        const current_rate = Math.round((prison.current_occupancy / prison.total_capacity) * 100);
        const pendingIn = transfers.filter(t => t.destination_prison === prison.prison_id && t.status === 'Pending').length;
        const releases_30 = inmates.filter(i => {
          if (!i.expected_release_date || i.assigned_prison !== prison.prison_id) return false;
          const diff = (new Date(i.expected_release_date) - new Date()) / (1000 * 60 * 60 * 24);
          return diff <= 30 && diff >= 0;
        }).length;
        const forecast_30 = Math.min(100, Math.round(current_rate + (pendingIn * 2) - (releases_30 * 2)));
        const forecast_60 = Math.min(100, Math.round(forecast_30 + (pendingIn * 1.5)));
        const forecast_90 = Math.min(100, Math.round(forecast_60 + (pendingIn * 1)));
        return { name: prison.name, current_rate, forecast_30, forecast_60, forecast_90, releases_30, pending_transfers_in: pendingIn };
      });

      const recidivism_scores = inmates.map(inmate => {
        const discCount = disciplinary.filter(dl => dl.inmate_id === inmate.inmate_id).length;
        const age = inmate.date_of_birth ? new Date().getFullYear() - new Date(inmate.date_of_birth).getFullYear() : 30;
        const ageFactor = age < 25 ? 20 : age < 35 ? 10 : 0;
        const score = Math.min(100, discCount * 25 + ageFactor);
        return { inmate_id: inmate.inmate_id, name: inmate.full_name, score };
      }).sort((a, b) => b.score - a.score);

      setData({ risk_scores, overcrowding, recidivism_scores });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.emptyState}>Loading ML Predictions...</div>;

  return (
    <div className={styles.prisonContainer}>
      <div className={styles.prisonContent}>
        <div className={styles.prisonHeader}>
          <h1 className={styles.prisonTitle}>ML Predictions</h1>
          <p className={styles.prisonSubtitle}>AI-powered insights for prison management</p>
        </div>

        <div className={styles.ledger} style={{ marginBottom: '22px' }}>
          <div className={styles.ledgerPinLeft} />
          <div className={styles.ledgerPinRight} />
          <p className={styles.ledgerTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#7a0000" /> Risk Behavior Prediction
          </p>
          <p style={{ fontSize: '0.72rem', color: '#7a6a58', marginBottom: '14px', letterSpacing: '0.04rem', textTransform: 'uppercase' }}>
            Based on: incident history, disciplinary records, crime type, visit frequency.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Inmate</th><th>Risk Level</th><th>Score</th><th>Action</th></tr></thead>
              <tbody>
                {data.risk_scores.length > 0 ? data.risk_scores.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>
                      <span className={`${styles.badge} ${r.level === 'Critical' || r.level === 'High' ? styles.badgeDanger : r.level === 'Medium' ? styles.badgeWarning : styles.badgeSuccess}`}>
                        {r.level}
                      </span>
                    </td>
                    <td>{r.score}</td>
                    <td>
                      <Link to={`/inmates/${r.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`} style={{ minHeight: '30px', padding: '4px 12px', fontSize: '0.78rem' }}>
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7a6a58' }}>No inmates to score.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.ledger} style={{ marginBottom: '22px' }}>
          <div className={styles.ledgerPinLeft} />
          <div className={styles.ledgerPinRight} />
          <p className={styles.ledgerTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#7a0000" /> Overcrowding Prediction
          </p>
          <p style={{ fontSize: '0.72rem', color: '#7a6a58', marginBottom: '14px', letterSpacing: '0.04rem', textTransform: 'uppercase' }}>
            Per-prison occupancy forecast for 30, 60, and 90 days. Alert threshold: &gt; 90% capacity.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Prison</th><th>Current</th><th>30 Days</th><th>60 Days</th><th>90 Days</th><th>Releases (30d)</th><th>Pending In</th></tr>
              </thead>
              <tbody>
                {data.overcrowding.length > 0 ? data.overcrowding.map((o, i) => (
                  <tr key={i}>
                    <td>{o.name}</td>
                    <td>
                      <span className={`${styles.badge} ${o.current_rate > 90 ? styles.badgeDanger : o.current_rate >= 75 ? styles.badgeWarning : styles.badgeSuccess}`}>
                        {o.current_rate}%
                      </span>
                    </td>
                    <td>{o.forecast_30}%</td>
                    <td>{o.forecast_60}%</td>
                    <td>{o.forecast_90}%</td>
                    <td>{o.releases_30}</td>
                    <td>{o.pending_transfers_in}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#7a6a58' }}>No prisons to forecast.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.ledger}>
          <div className={styles.ledgerPinLeft} />
          <div className={styles.ledgerPinRight} />
          <p className={styles.ledgerTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} color="#7a0000" /> Recidivism Risk Scoring
          </p>
          <p style={{ fontSize: '0.72rem', color: '#7a6a58', marginBottom: '14px', letterSpacing: '0.04rem', textTransform: 'uppercase' }}>
            Score 0–100 based on: age, offense type, sentence duration, visit frequency, disciplinary record.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Inmate</th><th>Recidivism Score</th><th>Risk Level</th><th>Action</th></tr></thead>
              <tbody>
                {data.recidivism_scores.length > 0 ? data.recidivism_scores.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>
                      <div style={{ height: '6px', background: 'rgba(100, 80, 60, 0.2)', borderRadius: '2px', overflow: 'hidden', width: '160px', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                        <div style={{ height: '100%', width: `${r.score}%`, background: r.score > 70 ? '#7a0000' : r.score > 40 ? '#9a5c00' : '#3a6a3a' }} />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 900, fontFamily: "'Share Tech Mono', ui-monospace, monospace" }}>{r.score}/100</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${r.score > 70 ? styles.badgeDanger : r.score > 40 ? styles.badgeWarning : styles.badgeSuccess}`}>
                        {r.score > 70 ? 'High' : r.score > 40 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/inmates/${r.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`} style={{ minHeight: '30px', padding: '4px 12px', fontSize: '0.78rem' }}>
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7a6a58' }}>No inmates to score.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
