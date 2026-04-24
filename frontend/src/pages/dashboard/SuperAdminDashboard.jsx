import React, { useEffect, useState } from 'react';
import { Users, Building, AlertTriangle, Clock, Activity } from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import styles from './DashboardStyles.module.css';

export const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/superadmin');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.loading}>Connecting to secure network...</div>
  );
  if (!data) return (
    <div className={styles.error}>Unable to establish connection to the system.</div>
  );

  const totalPrisons = data.prisons?.length || 0;
  const totalInmates = data.prisons?.reduce((sum, p) => sum + p.current_occupancy, 0) || 0;

  const kpiData = [
    { title: 'Total Prisons',     value: totalPrisons.toString(),              icon: Building,      color: 'var(--text-secondary)' },
    { title: 'Total Inmates',     value: totalInmates.toLocaleString(),        icon: Users,         color: 'var(--text-secondary)' },
    { title: 'Pending Transfers', value: (data.transfer_stats?.pending ?? 0).toString(), icon: Clock, color: 'var(--color-warning)' },
    { title: 'System Alerts',     value: (data.alerts?.length ?? 0).toString(), icon: AlertTriangle, color: 'var(--color-danger)' },
  ];

  const getRateClass = (rate) => {
    if (rate > 90) return styles.red;
    if (rate >= 75) return styles.amber;
    return styles.green;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Super Admin Dashboard</h1>
        <p className={styles.subtitle}>Centralized Prison Management System</p>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      <div className={styles.panelsRow}>
        {/* Occupancy Rate */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}><Activity size={18} /> Occupancy Rate per Prison</h2>
          {data.prisons?.length > 0 ? (
            data.prisons.map((prison, i) => {
              const rate = Math.round((prison.current_occupancy / prison.total_capacity) * 100);
              const rateClass = getRateClass(rate);
              return (
                <div key={i} className={styles.prisonItem}>
                  <div className={styles.prisonLabel}>
                    <span>{prison.name}</span>
                    <span className={`${styles.rateValue} ${rateClass}`}>{rate}%</span>
                  </div>
                  <div className={styles.occupancyBar}>
                    <div 
                      className={`${styles.occupancyFill} ${rateClass}`} 
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className={styles.emptyState}>No prisons registered yet.</p>
          )}
        </div>

        {/* System Alerts */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}><AlertTriangle size={18} /> System Alerts — Overcrowding</h2>
          {data.alerts?.length > 0 ? (
            data.alerts.map((alert, i) => (
              <div key={i} className={styles.alertItem}>
                <strong>{alert.name}</strong> is at {alert.rate}% capacity ({alert.current_occupancy}/{alert.total_capacity})
              </div>
            ))
          ) : (
            <p className={styles.allClear}>✓ ALL SYSTEMS NOMINAL</p>
          )}
        </div>
      </div>

      {/* High-Risk Inmates */}
      <div className={styles.panel} style={{ width: '100%' }}>
        <h2 className={styles.panelTitle}>🔴 High-Risk Inmates</h2>
        {data.high_risk?.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Inmate</th>
                  <th>Incidents</th>
                </tr>
              </thead>
              <tbody>
                {data.high_risk.map((hr, i) => (
                  <tr key={i}>
                    <td>{hr.full_name}</td>
                    <td className={styles.danger}>{hr.incident_count} incidents</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.allClear}>No high-risk profiles found.</p>
        )}
      </div>
    </div>
  );
};
