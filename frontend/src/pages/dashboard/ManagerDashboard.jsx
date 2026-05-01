import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, Clock, Activity, ArrowRightLeft } from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import styles from './DashboardStyles.module.css';
import { getDashboardData, getVisits, getInmates, getIncidents, getPrisons, getBlocks, getTransfers } from '../../data/mockData';

export const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const result = getDashboardData('manager');
    const allVisits = getVisits();
    const inmates = getInmates();
    const incidents = getIncidents();
    const prisons = getPrisons();
    const transfers = getTransfers();

    // Pending visits enriched
    const pending_visits = allVisits
      .filter(v => v.status === 'Pending' && v.prison_id === 2)
      .map(v => ({
        ...v,
        inmate_name: inmates.find(i => i.national_id === v.inmate_national_id)?.full_name || '—',
      }));

    // Upcoming visits (Approved, future dates)
    const today = new Date();
    const upcoming_visits = allVisits
      .filter(v => v.status === 'Approved' && v.prison_id === 2 && new Date(v.visit_date) >= today)
      .map(v => ({
        ...v,
        inmate_name: inmates.find(i => i.national_id === v.inmate_national_id)?.full_name || '—',
      }));

    // Recent incidents — last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent_incidents = incidents
      .filter(inc => inc.prison_id === 2 && new Date(inc.date_time) >= thirtyDaysAgo)
      .map(inc => ({
        ...inc,
        block_name: getBlocks().find(b => b.block_id === inc.block_id)?.name || '—',
      }));

    // Pending transfers enriched
    const pending_transfers = transfers
      .filter(t => t.requesting_prison === 2 && t.status === 'Pending')
      .map(t => ({
        ...t,
        inmate_name: inmates.find(i => i.inmate_id === t.inmate_id)?.full_name || '—',
        dest_name: prisons.find(p => p.prison_id === t.destination_prison)?.name || '—',
      }));

    setData({
      ...result,
      pending_visits,
      upcoming_visits,
      recent_incidents,
      pending_transfers,
      active_incidents: { count: recent_incidents.length },
    });
    setLoading(false);
  }, []);

  if (loading) return <div className={styles.loading}>Connecting to secure network...</div>;
  if (!data || !data.prison) return <div className={styles.error}>No prison assigned or data unavailable.</div>;

  const { prison, blocks, active_incidents, pending_visits, upcoming_visits, recent_incidents, pending_transfers } = data;

  const kpiData = [
    { title: 'Occupancy', value: `${prison.current_occupancy} / ${prison.total_capacity}`, icon: Users, color: 'var(--text-secondary)' },
    { title: 'Incidents (30d)', value: (active_incidents.count || 0).toString(), icon: AlertTriangle, color: 'var(--color-warning)' },
    { title: 'Pending Visits', value: (pending_visits?.length || 0).toString(), icon: Clock, color: 'var(--text-secondary)' },
    { title: 'Pending Transfers', value: (pending_transfers?.length || 0).toString(), icon: ArrowRightLeft, color: 'var(--text-secondary)' },
  ];

  const getRateClass = (rate) => {
    if (rate > 90) return styles.red;
    if (rate >= 75) return styles.amber;
    return styles.green;
  };

  const handleVisitAction = (visitId, action) => {
    setData((current) => ({
      ...current,
      pending_visits: (current.pending_visits || []).filter((v) => v.visit_id !== visitId),
    }));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prison Manager Dashboard</h1>
        <p className={styles.subtitle}>{prison.name} — Facility Operations</p>
      </div>

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Occupancy by Block */}
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}><Activity size={18} /> Occupancy by Block</h2>
        {blocks?.length > 0 ? blocks.map((block, i) => {
          const rateClass = getRateClass(block.occupancy_rate);
          return (
            <div key={i} className={styles.blockItem}>
              <div className={styles.labelRow}>
                <span>{block.name} ({block.security_level})</span>
                <span className={`${styles.rateValue} ${rateClass}`}>{block.current_occupancy}/{block.capacity} — {block.occupancy_rate}%</span>
              </div>
              <div className={styles.occupancyBar}>
                <div className={`${styles.occupancyFill} ${rateClass}`} style={{ width: `${block.occupancy_rate}%` }} />
              </div>
            </div>
          );
        }) : <p className={styles.emptyState}>No blocks defined.</p>}
      </div>

      <div className={styles.panelsRow}>
        {/* Pending Visit Requests */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Pending Visit Requests</h2>
          {pending_visits?.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Inmate</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {pending_visits.map((v, i) => (
                    <tr key={i}>
                      <td>{v.inmate_name}</td>
                      <td>
                        <span className={`${styles.badge} ${v.visit_type === 'Legal' ? styles.badgeInfo : styles.badgeSuccess}`}>
                          {v.visit_type}
                        </span>
                      </td>
                      <td>{v.visit_date}</td>
                      <td className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => handleVisitAction(v.visit_id, 'approve')}>✓</button>
                        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleVisitAction(v.visit_id, 'deny')}>✗</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className={styles.emptyState}>No pending visit requests.</p>}
        </div>

        {/* Upcoming Releases */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Upcoming Releases (30 days)</h2>
          {data.upcoming_releases?.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Inmate</th><th>Release Date</th></tr></thead>
                <tbody>
                  {data.upcoming_releases.map((inmate, i) => (
                    <tr key={i}>
                      <td>{inmate.full_name}</td>
                      <td>{inmate.expected_release_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className={styles.emptyState}>No upcoming releases.</p>}
        </div>
      </div>

      {/* Upcoming Visits */}
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Upcoming Visits</h2>
        {upcoming_visits?.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Inmate</th><th>Type</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {upcoming_visits.map((v, i) => (
                  <tr key={i}>
                    <td>{v.inmate_name}</td>
                    <td>
                      <span className={`${styles.badge} ${v.visit_type === 'Legal' ? styles.badgeInfo : styles.badgeSuccess}`}>
                        {v.visit_type}
                      </span>
                    </td>
                    <td>{v.visit_date}</td>
                    <td>{v.time_slot || '—'}</td>
                    <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className={styles.emptyState}>No upcoming visits.</p>}
      </div>

      {/* Recent Incidents */}
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}><AlertTriangle size={18} /> Recent Incidents (Last 30 Days)</h2>
        {recent_incidents?.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Type</th><th>Block</th><th>Date/Time</th><th>Action Taken</th></tr></thead>
              <tbody>
                {recent_incidents.map((inc, i) => (
                  <tr key={i}>
                    <td><span className={`${styles.badge} ${styles.badgeDanger}`}>{inc.type}</span></td>
                    <td>{inc.block_name}</td>
                    <td style={{ fontSize: '0.8rem' }}>{inc.date_time}</td>
                    <td style={{ fontSize: '0.8rem' }}>{inc.action_taken || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className={styles.emptyState}>No incidents in the last 30 days.</p>}
      </div>

      {/* Pending Transfers */}
      {pending_transfers?.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Pending Transfer Requests</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Inmate</th><th>Destination</th><th>Status</th></tr></thead>
              <tbody>
                {pending_transfers.map((t, i) => (
                  <tr key={i}>
                    <td>{t.inmate_name}</td>
                    <td>{t.dest_name}</td>
                    <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};