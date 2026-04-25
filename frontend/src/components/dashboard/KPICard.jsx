import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './KPICard.module.css';

const trendPalette = {
  up: {
    color: 'var(--color-danger)',
    background: 'rgba(239, 68, 68, 0.14)',
  },
  down: {
    color: 'var(--color-success)',
    background: 'rgba(34, 197, 94, 0.14)',
  },
  normal: {
    color: 'var(--color-primary)',
    background: 'rgba(59, 130, 246, 0.14)',
  },
};

export const KPICard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const CardIcon = Icon || Minus;
  const hasTrend = (trend === 'up' || trend === 'down' || trend === 'normal') && trendValue !== undefined && trendValue !== null;
  const palette = trendPalette[trend] || trendPalette.normal;

  const renderTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} />;
      case 'down':
        return <TrendingDown size={14} />;
      case 'normal':
        return <Minus size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.card} data-light-target="true">
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{title}</h3>
          {hasTrend && (
            <div
              className={styles.trendInline}
              style={{
                '--trend-color': palette.color,
                '--trend-bg': palette.background,
              }}
            >
              {renderTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={styles.iconWrapper} style={{ color }}>
          <CardIcon size={24} />
        </div>
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};
