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
  const totalCapacity = data.prisons?.reduce((sum, p) => sum + p.total_capacity, 0) || 0;
  const alertsCount = data.alerts?.length ?? 0;
  const pendingTransfers = data.transfer_stats?.pending ?? 0;
  const approvedTransfers = data.transfer_stats?.approved ?? 0;
  const activePrisons = data.prisons?.filter((prison) => prison.current_occupancy > 0).length || 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalInmates / totalCapacity) * 100) : 0;
  const alertShare = totalPrisons > 0 ? Math.round((alertsCount / totalPrisons) * 100) : 0;

  const kpiData = [
    {
      title: 'Total Prisons',
      value: totalPrisons.toString(),
      icon: Building,
      color: 'var(--color-primary)',
      trend: 'normal',
      trendValue: `${activePrisons} active`,
    },
    {
      title: 'Total Inmates',
      value: totalInmates.toLocaleString(),
      icon: Users,
      color: 'var(--color-success)',
      trend: totalInmates > 0 ? 'up' : 'normal',
      trendValue: `${occupancyRate}% capacity`,
    },
    {
      title: 'Pending Transfers',
      value: pendingTransfers.toString(),
      icon: Clock,
      color: 'var(--color-warning)',
      trend: pendingTransfers > 0 ? 'down' : 'normal',
      trendValue: `${approvedTransfers} approved`,
    },
    {
      title: 'System Alerts',
      value: alertsCount.toString(),
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      trend: alertsCount > 0 ? 'down' : 'normal',
      trendValue: `${alertShare}% flagged`,
    },
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
