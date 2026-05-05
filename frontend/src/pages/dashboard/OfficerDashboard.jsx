import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, UserMinus, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KPICard } from '../../components/dashboard/KPICard';
import styles from './DashboardStyles.module.css';

export const OfficerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nationalId = localStorage.getItem('userNationalId');
    Promise.all([
      fetch(`/api/incidents/officer/${nationalId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/shift/officer/${nationalId}`).then(r => r.json()).catch(() => []),
    ]).then(([incidents, shifts]) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recent_incidents = incidents.filter(inc => new Date(inc.occurred_at) >= sevenDaysAgo);
      const today = new Date().toISOString().split('T')[0];
      const my_shifts = shifts.filter(s => s.date >= today);
      setData({ recent_incidents, my_shifts, assigned_blocks: [], cells: [], active_solitary: [] });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Connecting to secure network...</div>;
  if (!data) return <div className={styles.error}>Data unavailable.</div>;

  const { assigned_blocks, cells, recent_incidents, active_solitary, my_shifts } = data;

  const kpiData = [
    { title: 'Assigned Blocks', value: (assigned_blocks?.length || 0).toString(), icon: Shield, color: 'var(--text-secondary)' },
    { title: 'Recent Incidents', value: (recent_incidents?.length || 0).toString(), icon: AlertTriangle, color: 'var(--color-warning)' },
    { title: 'Active Solitary', value: (active_solitary?.length || 0).toString(), icon: UserMinus, color: 'var(--color-danger)' },
    { title: 'Upcoming Shifts', value: (my_shifts?.length || 0).toString(), icon: Calendar, color: 'var(--text-secondary)' },
  ];

  const getCellStatus = (current, capacity) => {
    if (current >= capacity) return { label: 'Full', class: styles.badgeDanger };
    if (current > 0) return { label: 'Occupied', class: styles.badgeWarning };
    return { label: 'Empty', class: styles.badgeSuccess };
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Officer Dashboard</h1>

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Block Occupancy — Cell View</h2>
        {cells?.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Block</th><th>Cell ID</th><th>Occupancy</th><th>Capacity</th><th>Status</th></tr></thead>
              <tbody>
                {cells.map((cell, i) => {
                  const status = getCellStatus(cell.current_occupancy, cell.capacity);
                  return (
                    <tr key={i}>
                      <td>{cell.block_name}</td>
                      <td>Cell #{cell.cell_id}</td>
                      <td>{cell.current_occupancy}</td>
                      <td>{cell.capacity}</td>
                      <td><span className={`${styles.badge} ${status.class}`}>{status.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p className={styles.emptyState}>No cells assigned to your blocks.</p>}
      </div>

      <div className={styles.panelsRow}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Recent Incidents (7 days)</h2>
          {recent_incidents?.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Type</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {recent_incidents.map((inc, i) => (
                    <tr key={i}>
                      <td><span className={`${styles.badge} ${styles.badgeDanger}`}>{inc.type}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{inc.date_time}</td>
                      <td>
                        <Link to={`/incidents/${inc.incident_id}`} className={styles.badgeInfo} style={{ borderRadius: '4px', padding: '4px 8px', display: 'inline-block' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className={styles.emptyState}>No recent incidents.</p>}
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Active Solitary Confinement</h2>
          {active_solitary?.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Inmate</th><th>End Date</th></tr></thead>
                <tbody>
                  {active_solitary.map((s, i) => (
                    <tr key={i}>
                      <td>{s.full_name}</td>
                      <td>{s.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className={styles.emptyState}>No active solitary confinement orders.</p>}
        </div>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}><Calendar size={18} /> My Upcoming Shifts</h2>
        {my_shifts?.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Shift</th><th>Block</th><th>Time</th></tr></thead>
              <tbody>
                {my_shifts.map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td>
                    <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{s.shift_type}</span></td>
                    <td>{s.block_name}</td>
                    <td>{s.start_time} — {s.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className={styles.emptyState}>No upcoming shifts assigned.</p>}
      </div>
    </div>
  );
};