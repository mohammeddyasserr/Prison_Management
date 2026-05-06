import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Building, Clock, Users } from 'lucide-react';
import styles from './DashboardStyles.module.css';

const getRate = (occupancy = 0, capacity = 0) => (
  capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0
);

const getRateTone = (rate) => {
  if (rate > 90) return styles.red;
  if (rate >= 75) return styles.amber;
  return styles.green;
};

const hasInvolvedInmate = (incident, inmateId) => {
  const involved = incident.involved_inmate_ids;
  if (Array.isArray(involved)) {
    return involved.some((id) => String(id) === String(inmateId));
  }
  if (typeof involved === 'string') {
    return involved.split(',').some((id) => id.trim() === String(inmateId));
  }
  return false;
};

const TallyMarks = ({ count }) => {
  const groups = Math.floor(count / 5);
  const rem = count % 5;
  const groupW = 52;
  const markH = 44;
  const totalGroups = groups + (rem > 0 ? 1 : 0);
  const totalW = Math.max(totalGroups * groupW, 10);
  const lines = [];
  const wobbles = [[-3, 2], [-1, 1], [1, -1], [2, 3]];

  const addLine = (x1, y1, x2, y2, w, op, key) => {
    lines.push(
      <line
        key={`a-${key}`}
        x1={x1.toFixed(1)}
        y1={y1.toFixed(1)}
        x2={x2.toFixed(1)}
        y2={y2.toFixed(1)}
        stroke="rgba(218,202,172,0.72)"
        strokeWidth={w}
        strokeLinecap="round"
        opacity={op}
      />,
      <line
        key={`b-${key}`}
        x1={(x1 + 0.7).toFixed(1)}
        y1={(y1 + 0.5).toFixed(1)}
        x2={(x2 + 0.7).toFixed(1)}
        y2={(y2 + 0.5).toFixed(1)}
        stroke="rgba(240,220,185,0.55)"
        strokeWidth={(w * 0.35).toFixed(1)}
        strokeLinecap="round"
        opacity={(op * 0.5).toFixed(2)}
      />,
    );
  };

  for (let g = 0; g < groups; g += 1) {
    const ox = g * groupW;
    for (let i = 0; i < 4; i += 1) {
      const x = ox + i * 10 + 6;
      const [dy1, dy2] = wobbles[i];
      const lean = (i % 2 === 0 ? -1 : 1) * 1.5;
      addLine(x + lean, 6 + dy1, x - lean, 6 + markH + dy2, 2.2, 0.88, `g${g}v${i}`);
    }
    addLine(ox + 2, 14, ox + groupW - 2, 36, 2.5, 0.92, `g${g}slash`);
  }

  for (let i = 0; i < rem; i += 1) {
    const ox = groups * groupW + i * 10 + 6;
    const lean = (i % 2 === 0 ? -1 : 1) * 1.2;
    addLine(ox + lean, 7, ox - lean, 7 + markH, 2.2, 0.88, `r${i}`);
  }

  return (
    <svg
      viewBox={`0 0 ${totalW} 56`}
      className={styles.tallySvg}
      aria-label={`${count} tally marks`}
    >
      {lines}
    </svg>
  );
};

const WallBackground = () => (
  <div className={styles.wallBackground} aria-hidden="true">
    <div className={styles.wallGrain} />
    <div className={styles.blockLines} />
    <div className={styles.stainOne} />
    <div className={styles.stainTwo} />
    <div className={styles.lightTube} />
    <div className={styles.lightCone} />
  </div>
);

const FlickerLight = () => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.84) {
        setOpacity(0.16 + Math.random() * 0.58);
        setTimeout(() => setOpacity(1), 35 + Math.random() * 65);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return <div className={styles.flickerLight} style={{ opacity }} aria-hidden="true" />;
};

const BarOverlay = () => (
  <div className={styles.barOverlay} aria-hidden="true">
    {[0, 1, 2].map((bar) => <div key={bar} className={styles.bar} />)}
  </div>
);

const PaperNote = ({ title, children, rotation = 0, pinColor = '#c0392b', delay = 0 }) => (
  <section
    className={styles.paperNote}
    style={{
      '--paper-rotation': `${rotation}deg`,
      '--pin-color': pinColor,
      '--paper-delay': `${delay}ms`,
    }}
  >
    <h2 className={styles.noteTitle}>{title}</h2>
    {children}
  </section>
);

const HandwrittenStat = ({ label, value, urgent = false, icon: Icon }) => (
  <div className={styles.handStat}>
    <div className={styles.statLabel}>
      {Icon && <Icon size={13} />}
      <span>{label}</span>
    </div>
    <div className={`${styles.statValue} ${urgent ? styles.urgent : ''}`}>
      {value}
    </div>
    {urgent && <div className={styles.urgentLine} />}
  </div>
);

const PrisonDetail = ({ prison }) => {
  if (!prison) return null;

  const rate = getRate(prison.current_occupancy, prison.total_capacity);
  const rateTone = getRateTone(rate);

  return (
    <div className={styles.detailPanel}>
      <h3>{prison.name}</h3>
      <div className={styles.detailGrid}>
        <div>
          <span>Security</span>
          <strong>{prison.security_level || 'Unlisted'}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{prison.location || 'Unlisted'}</strong>
        </div>
        <div>
          <span>Occupancy</span>
          <strong>{prison.current_occupancy || 0}/{prison.total_capacity || 0}</strong>
        </div>
        <div>
          <span>Incidents</span>
          <strong className={prison.incident_count > 0 ? styles.redText : ''}>{prison.incident_count || 0}</strong>
        </div>
      </div>
      <div className={styles.detailBar}>
        <div className={`${styles.detailFill} ${rateTone}`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
    </div>
  );
};

const SecureStatus = ({ type = 'loading', children }) => (
  <div className={styles.dashboardShell}>
    <WallBackground />
    <FlickerLight />
    <BarOverlay />
    <div className={`${styles.statusNote} ${type === 'error' ? styles.statusError : ''}`}>
      {children}
    </div>
  </div>
);

export const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [selectedPrisonId, setSelectedPrisonId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch('/api/prison').then((r) => r.json()).catch(() => []),
      fetch('/api/transfer').then((r) => r.json()).catch(() => []),
      fetch('/api/incidents').then((r) => r.json()).catch(() => []),
      fetch('/api/inmates').then((r) => r.json()).catch(() => []),
    ])
      .then(([prisons, transfers, incidents, inmates]) => {
        if (!isMounted) return;

        const prisonRows = Array.isArray(prisons) ? prisons : [];
        const transferRows = Array.isArray(transfers) ? transfers : [];
        const incidentRows = Array.isArray(incidents) ? incidents : [];
        const inmateRows = Array.isArray(inmates) ? inmates : [];

        const prisonIncidentCounts = incidentRows.reduce((counts, incident) => {
          if (incident.prison_id) {
            counts[incident.prison_id] = (counts[incident.prison_id] || 0) + 1;
          }
          return counts;
        }, {});

        const enhancedPrisons = prisonRows.map((prison) => {
          const rate = getRate(prison.current_occupancy, prison.total_capacity);
          return {
            ...prison,
            rate,
            incident_count: prisonIncidentCounts[prison.prison_id] || 0,
          };
        });

        const alerts = enhancedPrisons.filter((prison) => prison.rate > 90);
        const highRisk = inmateRows
          .map((inmate) => ({
            ...inmate,
            incident_count: incidentRows.filter((incident) => hasInvolvedInmate(incident, inmate.inmate_id)).length,
          }))
          .filter((inmate) => inmate.incident_count >= 2)
          .sort((a, b) => b.incident_count - a.incident_count);

        setData({
          prisons: enhancedPrisons,
          alerts,
          highRisk,
          transferStats: {
            pending: transferRows.filter((transfer) => transfer.status === 'Pending').length,
            approved: transferRows.filter((transfer) => transfer.status === 'Approved').length,
          },
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const summary = useMemo(() => {
    const prisons = data?.prisons || [];
    const totalPrisons = prisons.length;
    const totalInmates = prisons.reduce((sum, prison) => sum + (prison.current_occupancy || 0), 0);
    const totalCapacity = prisons.reduce((sum, prison) => sum + (prison.total_capacity || 0), 0);
    const activePrisons = prisons.filter((prison) => (prison.current_occupancy || 0) > 0).length;
    const occupancyRate = getRate(totalInmates, totalCapacity);
    const alertsCount = data?.alerts?.length || 0;
    const pendingTransfers = data?.transferStats?.pending || 0;
    const approvedTransfers = data?.transferStats?.approved || 0;

    return {
      totalPrisons,
      totalInmates,
      totalCapacity,
      activePrisons,
      occupancyRate,
      alertsCount,
      pendingTransfers,
      approvedTransfers,
    };
  }, [data]);

  if (loading) {
    return <SecureStatus>Connecting to secure network...</SecureStatus>;
  }

  if (!data) {
    return (
      <SecureStatus type="error">
        Unable to establish connection to the system.
      </SecureStatus>
    );
  }

  const selectedPrison = data.prisons.find((prison) => prison.prison_id === selectedPrisonId);
  const tallyCount = Math.max(5, Math.min(55, summary.totalPrisons * 5 + summary.alertsCount + summary.pendingTransfers));

  return (
    <div className={styles.dashboardShell}>
      <WallBackground />
      <FlickerLight />
      <BarOverlay />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.metaRow}>
            {time.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            <span aria-hidden="true">|</span>
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <h1 className={styles.title}>CPMS Control</h1>
          <p className={styles.subtitle}>Super Admin National Command Ledger</p>
        </header>

        <section className={styles.tallyBlock}>
          <div className={styles.sectionLabel}>National Ledger Count</div>
          <TallyMarks count={tallyCount} />
        </section>

        <section className={styles.noteGrid} aria-label="System summary">
          <PaperNote title="System Status" rotation={-1.4} pinColor="#c0392b" delay={0}>
            <HandwrittenStat label="Total Inmates" value={summary.totalInmates.toLocaleString()} icon={Users} />
            <HandwrittenStat
              label="Capacity"
              value={`${summary.occupancyRate}%`}
              urgent={summary.occupancyRate > 85}
              icon={Activity}
            />
          </PaperNote>

          <PaperNote title="Facilities" rotation={0.9} pinColor="#2c3e50" delay={80}>
            <HandwrittenStat label="Total Prisons" value={summary.totalPrisons} icon={Building} />
            <HandwrittenStat label="Active Prisons" value={summary.activePrisons} icon={Activity} />
          </PaperNote>

          <PaperNote title="Alerts" rotation={-0.6} pinColor="#e67e22" delay={160}>
            <HandwrittenStat
              label="Overcrowding"
              value={summary.alertsCount}
              urgent={summary.alertsCount > 0}
              icon={AlertTriangle}
            />
            <HandwrittenStat label="Pending Transfers" value={summary.pendingTransfers} icon={Clock} />
          </PaperNote>

          <PaperNote title="Transfer Desk" rotation={1.2} pinColor="#34495e" delay={220}>
            <HandwrittenStat label="Approved" value={summary.approvedTransfers} icon={Clock} />
            <HandwrittenStat label="System Capacity" value={summary.totalCapacity.toLocaleString()} icon={Users} />
          </PaperNote>
        </section>

        <section className={styles.ledger}>
          <div className={styles.ledgerPinLeft} aria-hidden="true" />
          <div className={styles.ledgerPinRight} aria-hidden="true" />

          <div className={styles.ledgerTitle}>Facility Register</div>

          <div className={styles.ledgerHeader}>
            <div>Facility</div>
            <div className={styles.occupancyCell}>Occupancy</div>
            <div>Rate</div>
            <div>Alerts</div>
          </div>

          <div className={styles.ledgerRows}>
            {data.prisons.length > 0 ? (
              data.prisons.map((prison) => {
                const isSelected = selectedPrisonId === prison.prison_id;
                const rateTone = getRateTone(prison.rate);
                const alertScore = prison.rate > 90 ? prison.incident_count + 1 : prison.incident_count;

                return (
                  <button
                    key={prison.prison_id}
                    type="button"
                    className={`${styles.facilityRow} ${isSelected ? styles.selectedRow : ''}`}
                    onClick={() => setSelectedPrisonId(isSelected ? null : prison.prison_id)}
                    aria-pressed={isSelected}
                  >
                    <span className={`${styles.facilityName} ${prison.rate > 85 ? styles.redText : ''}`}>
                      {prison.rate > 85 && <AlertTriangle size={13} />}
                      {prison.name}
                    </span>
                    <span className={`${styles.occupancyCell} ${styles.monoValue}`}>
                      {prison.current_occupancy || 0}/{prison.total_capacity || 0}
                    </span>
                    <span className={`${styles.rateValue} ${rateTone}`}>{prison.rate}%</span>
                    <span className={`${styles.alertCount} ${alertScore > 0 ? styles.redText : ''}`}>
                      {alertScore > 0 ? `[${alertScore}]` : '-'}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className={styles.emptyState}>No prisons registered yet.</p>
            )}
          </div>

          <PrisonDetail prison={selectedPrison} />

          <div className={styles.ledgerFooter}>System Administrator - CPMS v2.1</div>
        </section>

        <section className={styles.bottomGrid}>
          <div className={styles.dossierPanel}>
            <h2><AlertTriangle size={17} /> System Alerts - Overcrowding</h2>
            {data.alerts.length > 0 ? (
              data.alerts.map((alert) => (
                <div key={alert.prison_id} className={styles.alertItem}>
                  <strong>{alert.name}</strong>
                  <span>{alert.rate}% capacity ({alert.current_occupancy || 0}/{alert.total_capacity || 0})</span>
                </div>
              ))
            ) : (
              <p className={styles.allClear}>All systems nominal.</p>
            )}
          </div>

          <div className={styles.dossierPanel}>
            <h2><Users size={17} /> High-Risk Inmates</h2>
            {data.highRisk.length > 0 ? (
              <div className={styles.riskList}>
                {data.highRisk.slice(0, 6).map((inmate) => (
                  <div key={inmate.inmate_id} className={styles.riskItem}>
                    <span>{inmate.full_name}</span>
                    <strong>{inmate.incident_count} incidents</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.allClear}>No high-risk profiles found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
