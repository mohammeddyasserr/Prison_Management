import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './KPICard.module.css';

export const KPICard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const CardIcon = Icon || Minus;

  const renderTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color="var(--color-danger)" />;
      case 'down':
        return <TrendingDown size={14} color="var(--color-success)" />;
      default:
        return <Minus size={14} color="var(--text-secondary)" />;
    }
  };

  const trendColor = trend === 'up' ? 'var(--color-danger)' : trend === 'down' ? 'var(--color-success)' : 'var(--text-secondary)';

  return (
    <div className={styles.card} data-light-target="true">
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.trendInline} style={{ color: trendColor }}>
            {renderTrendIcon()}
            <span>{trendValue}</span>
          </div>
        </div>
        <div className={styles.iconWrapper} style={{ color }}>
          <CardIcon size={24} />
        </div>
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};
