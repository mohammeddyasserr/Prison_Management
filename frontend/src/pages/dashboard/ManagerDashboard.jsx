import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, Clock, Activity, ArrowRightLeft } from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import styles from './DashboardStyles.module.css';
import { postForm } from '../../lib/http';

export const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/manager');
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

  if (loading) return <div className={styles.loading}>Connecting to secure network...</div>;
  if (!data || !data.prison) return <div className={styles.error}>No prison assigned or data unavailable.</div>;

  const { prison, blocks, active_incidents, pending_visits, upcoming_releases, pending_transfers } = data;

  const kpiData = [
    { title: 'Occupancy', value: `${prison.current_occupancy} / ${prison.total_capacity}`, icon: Users, color: 'var(--text-secondary)' },
    { title: 'Active Incidents', value: (active_incidents.count || 0).toString(), icon: AlertTriangle, color: 'var(--color-warning)' },
    { title: 'Pending Visits', value: (pending_visits?.length || 0).toString(), icon: Clock, color: 'var(--text-secondary)' },
    { title: 'Pending Transfers', value: (pending_transfers?.length || 0).toString(), icon: ArrowRightLeft, color: 'var(--text-secondary)' },
  ];

  const getRateClass = (rate) => {
    if (rate > 90) return styles.red;
    if (rate >= 75) return styles.amber;
    return styles.green;
  };

  const handleVisitAction = async (visitId, action) => {
    await postForm(`/visits/${visitId}/${action}`, action === 'deny' ? { denial_reason: '' } : {});
    setData((current) => ({
      ...current,
      pending_visits: (current.pending_visits || []).filter((visit) => visit.visit_id !== visitId),
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

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}><Activity size={18} /> Occupancy by Block</h2>
        {blocks?.length > 0 ? (
          blocks.map((block, i) => {
            const rateClass = getRateClass(block.occupancy_rate);
            return (
              <div key={i} className={styles.blockItem}>
                <div className={styles.labelRow}>
                  <span>{block.name} ({block.security_level})</span>
                  <span className={`${styles.rateValue} ${rateClass}`}>{block.current_occupancy}/{block.capacity} — {block.occupancy_rate}%</span>
                </div>
                <div className={styles.occupancyBar}>
                  <div 
                    className={`${styles.occupancyFill} ${rateClass}`} 
                    style={{ width: `${block.occupancy_rate}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className={styles.emptyState}>No blocks defined.</p>
        )}
      </div>

      <div className={styles.panelsRow}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Pending Visit Requests</h2>
          {pending_visits?.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Visitor</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {pending_visits.map((v, i) => (
                    <tr key={i}>
                      <td>{v.visitor_name || 'N/A'}</td>
                      <td>{v.visit_date}</td>
                      <td className={styles.actions}>
                        <button
                          className={`${styles.btn} ${styles.btnSuccess}`}
                          onClick={() => handleVisitAction(v.visit_id, 'approve')}
                        >
                          ✓
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => handleVisitAction(v.visit_id, 'deny')}
                        >
                          ✗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.emptyState}>No pending visit requests.</p>
          )}
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Upcoming Releases (30 days)</h2>
          {upcoming_releases?.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Inmate</th><th>Release Date</th></tr></thead>
                <tbody>
                  {upcoming_releases.map((inmate, i) => (
                    <tr key={i}>
                      <td>{inmate.full_name}</td>
                      <td>{inmate.expected_release_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.emptyState}>No upcoming releases.</p>
          )}
        </div>
      </div>

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
