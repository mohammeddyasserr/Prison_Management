import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, Clock, Activity, ArrowRightLeft, Check, X } from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import styles from './DashboardStyles.module.css';

export const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nationalId = localStorage.getItem('userNationalId');
    // First get the manager's prison
    fetch(`/api/prison/user/${nationalId}`)
      .then(r => r.json())
      .then(async prison => {
        const prison_id = prison.prison_id;
        const [visits, incidents, transfers, blocksCells] = await Promise.all([
          fetch('/api/visit').then(r => r.json()).catch(() => []),
          fetch(`/api/incidents/prison/${prison_id}`).then(r => r.json()).catch(() => []),
          fetch('/api/transfer').then(r => r.json()).catch(() => []),
          fetch(`/api/prison/${prison_id}/blocks-cells`).then(r => r.json()).catch(() => []),
        ]);

        const today = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const pending_visits = visits.filter(v => v.status === 'Scheduled');
        const upcoming_visits = visits.filter(v => v.status === 'Scheduled' && new Date(v.visit_date) >= today);
        const recent_incidents = incidents.filter(inc => new Date(inc.occurred_at) >= thirtyDaysAgo);
        const pending_transfers = transfers.filter(t => t.requesting_prison === prison_id && t.status === 'Pending');

        // Format blocks for display
        const blocks = blocksCells.map(b => ({
          ...b,
          occupancy_rate: b.total_cells > 0 ? Math.round((b.total_inmates / b.total_cells) * 100) : 0,
        }));

        setData({ prison, blocks, pending_visits, upcoming_visits, recent_incidents, pending_transfers, upcoming_releases: [], active_incidents: { count: recent_incidents.length } });
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  const handleVisitAction = (visitId) => {
    setData((current) => ({
      ...current,
      pending_visits: (current.pending_visits || []).filter((v) => v.visit_id !== visitId),
    }));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prison Manager Dashboard</h1>
        <p className={styles.subtitle}>{prison.name} - Facility Operations</p>
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
                <span className={`${styles.rateValue} ${rateClass}`}>{block.current_occupancy}/{block.capacity} - {block.occupancy_rate}%</span>
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
                        <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => handleVisitAction(v.visit_id)} aria-label="Approve visit">
                          <Check size={16} />
                        </button>
                        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleVisitAction(v.visit_id)} aria-label="Deny visit">
                          <X size={16} />
                        </button>
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
                    <td>{v.time_slot || '-'}</td>
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
                    <td style={{ fontSize: '0.8rem' }}>{inc.action_taken || '-'}</td>
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
