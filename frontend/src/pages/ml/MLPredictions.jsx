import React, { useEffect, useState } from 'react';
import { Eye, TrendingUp, ShieldAlert, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../EntityStyles.module.css';

export const MLPredictions = () => {
  const [data, setData] = useState({ risk_scores: [], overcrowding: [], recidivism_scores: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ml/api/list');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch ML data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading ML Predictions...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ML Predictions</h1>

      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px'}}>
        <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <ShieldAlert size={20} color="var(--color-danger)" /> Risk Behavior Prediction
        </h2>
        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>
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
                    <Link to={`/inmates/${r.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No inmates to score.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px'}}>
        <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <TrendingUp size={20} color="var(--color-primary)" /> Overcrowding Prediction
        </h2>
        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Per-prison occupancy forecast for 30, 60, and 90 days. Alert threshold: &gt; 90% capacity.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>Prison</th><th>Current</th><th>30 Days</th><th>60 Days</th><th>90 Days</th>
                  <th>Releases (30d)</th><th>Pending In</th></tr>
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
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No prisons to forecast.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px'}}>
        <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <RotateCcw size={20} color="var(--color-warning)" /> Recidivism Risk Scoring
        </h2>
        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>
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
                    <div style={{height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', width: '200px', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px'}}>
                      <div style={{height: '100%', width: `${r.score}%`, background: r.score > 70 ? 'var(--color-danger)' : r.score > 40 ? 'var(--color-warning)' : 'var(--color-success)'}} />
                    </div>
                    <span style={{fontSize: '0.85rem', fontWeight: 700}}>{r.score}/100</span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${r.score > 70 ? styles.badgeDanger : r.score > 40 ? styles.badgeWarning : styles.badgeSuccess}`}>
                      {r.score > 70 ? 'High' : r.score > 40 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/inmates/${r.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No inmates to score.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
