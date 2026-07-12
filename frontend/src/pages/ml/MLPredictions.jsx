import React, { useEffect, useState } from 'react';
import { Eye, TrendingUp, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../PrisonStyles.module.css';

import { hasRole } from '../../services/authentication';

const getRateBadgeClass = (value) =>
  value > 90 ? styles.badgeDanger : value >= 75 ? styles.badgeWarning : styles.badgeSuccess;

const getForecastBadgeClass = (forecast, currentRate) =>
  forecast > currentRate ? (forecast > 90 ? styles.badgeDanger : styles.badgeWarning) : styles.badgeSuccess;

export const MLPredictions = () => {
  const [data, setData] = useState({ risk_scores: [], overcrowding: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let prisonId;
        if (hasRole('manager')) {
          const nationalId = localStorage.getItem('userNationalId') || '';
          const prisonRes = await fetch(`/api/prison/user/${nationalId}`);
          const prisonData = await prisonRes.json();
          prisonId = prisonData?.prison_id;
        }

        const query = prisonId ? `?prison_id=${prisonId}` : '';
        const [riskResponse, overcrowdingResponse] = await Promise.all([
          fetch(`/api/ML/risk${query}`).then((r) => r.json()),
          fetch(`/api/ML/overcrowding${query}`).then((r) => r.json()),
        ]);

        const risk_scores = (riskResponse || []).map((item) => ({
          inmate_id: item.inmate_id,
          name: item.full_name,
          score: item.recidivism ?? 0,
          level: item.risk_level || 'Low',
        }));

        const overcrowding = (overcrowdingResponse || []).map((item) => ({
          prison_id: item.prison_id,
          name: item.prison_name,
          current_rate: item.current_rate,
          forecast_30: item.forecast_rate_30,
          forecast_60: item.forecast_rate_60,
          forecast_90: item.forecast_rate_90,
          current_occupancy: item.current_occupancy,
          total_capacity: item.total_capacity,
        }));

        setData({ risk_scores, overcrowding });
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchData();
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
            <table className={styles.table} style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Inmate</th>
                  <th style={{ textAlign: 'center' }}>Risk Level</th>
                  <th style={{ textAlign: 'center' }}>Recidivism Score</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.risk_scores.length > 0 ? data.risk_scores.map((r, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{r.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${styles.badge} ${r.level === 'Critical' || r.level === 'High' ? styles.badgeDanger : r.level === 'Medium' ? styles.badgeWarning : styles.badgeSuccess}`}>
                        {r.level}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div style={{ height: '6px', background: 'rgba(100, 80, 60, 0.2)', borderRadius: '2px', overflow: 'hidden', width: '160px', display: 'inline-block', verticalAlign: 'middle' }}>
                          <div style={{ height: '100%', width: `${r.score}%`, background: r.score > 70 ? '#7a0000' : r.score > 40 ? '#9a5c00' : '#3a6a3a' }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 900, fontFamily: "'Share Tech Mono', ui-monospace, monospace", whiteSpace: 'nowrap' }}>
                          {r.score}/100
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/inmates/${r.inmate_id}`} className={`${styles.btn} ${styles.btnOutline}`} style={{ minHeight: '30px', padding: '4px 12px', fontSize: '0.78rem' }}>
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7a6a58' }}>No inmates to score.</td>
                  </tr>
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
            <table className={styles.table} style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '22%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Prison</th>
                  <th>Current Rate</th>
                  <th>Current Occupancy</th>
                  <th>Capacity</th>
                  <th>30 Days</th>
                  <th>60 Days</th>
                  <th>90 Days</th>
                </tr>
              </thead>
              <tbody>
                {data.overcrowding.length > 0 ? data.overcrowding.map((o, i) => (
                  <tr key={i}>
                    <td>{o.name}</td>
                    <td>
                      <span className={`${styles.badge} ${getRateBadgeClass(o.current_rate)}`}>
                        {o.current_rate}%
                      </span>
                    </td>
                    <td>{o.current_occupancy}</td>
                    <td>{o.total_capacity}</td>
                    <td>
                      <span className={`${styles.badge} ${getForecastBadgeClass(o.forecast_30, o.current_rate)}`}>
                        {o.forecast_30}%
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getForecastBadgeClass(o.forecast_60, o.current_rate)}`}>
                        {o.forecast_60}%
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getForecastBadgeClass(o.forecast_90, o.current_rate)}`}>
                        {o.forecast_90}%
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#7a6a58' }}>No prisons to forecast.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
