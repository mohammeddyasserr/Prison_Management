import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { formatRoleLabel, getUserName, getUserRole } from '../../services/authentication';

const navItemsByRole = {
  super_admin: [
    {
      section: 'Main',
      items: [{ name: 'Dashboard', icon: '📊', path: '/dashboard/superadmin' }],
    },
    {
      section: 'Administration',
      items: [
        { name: 'Prisons', icon: '🏢', path: '/prisons' },
        { name: 'Staff Management', icon: '👮', path: '/officers' },
        { name: 'Inmates', icon: '👤', path: '/inmates' },
        { name: 'Transfers', icon: '🔄', path: '/transfers' },
        { name: 'Visits', icon: '🕐', path: '/visits' },
        { name: 'Incidents', icon: '⚠️', path: '/incidents' },
        { name: 'Disciplinary', icon: '📋', path: '/disciplinary' },
        { name: 'Healthcare', icon: '🏥', path: '/healthcare' },
        { name: 'Shifts', icon: '🕐', path: '/shifts' },
      ],
    },
    {
      section: 'Analytics',
      items: [{ name: 'ML Predictions', icon: '🤖', path: '/ml' }],
    },
  ],
  prison_manager: [
    {
      section: 'Main',
      items: [{ name: 'Dashboard', icon: '📊', path: '/dashboard/manager' }],
    },
    {
      section: 'My Prison',
      items: [
        { name: 'Prison Details', icon: '🏢', path: '/prisons' },
        { name: 'Inmates', icon: '👤', path: '/inmates' },
        { name: 'Officers', icon: '👮', path: '/officers' },
      ],
    },
    {
      section: 'Operations',
      items: [
        { name: 'Transfers', icon: '🔄', path: '/transfers' },
        { name: 'Visits', icon: '👥', path: '/visits' },
        { name: 'Time Slots', icon: '🕐', path: '/visits/slots' },
        { name: 'Incidents', icon: '⚠️', path: '/incidents' },
        { name: 'Disciplinary', icon: '📋', path: '/disciplinary' },
        { name: 'Healthcare', icon: '🏥', path: '/healthcare' },
        { name: 'Shifts', icon: '📅', path: '/shifts' },
      ],
    },
    {
      section: 'Analytics',
      items: [{ name: 'ML Predictions', icon: '🤖', path: '/ml' }],
    },
  ],
  officer: [
    {
      section: 'Main',
      items: [{ name: 'Dashboard', icon: '📊', path: '/dashboard/officer' }],
    },
    {
      section: 'My Block',
      items: [{ name: 'Inmates', icon: '👤', path: '/inmates' }],
    },
    {
      section: 'Reporting',
      items: [
        { name: 'Incidents', icon: '⚠️', path: '/incidents' },
        { name: 'Disciplinary', icon: '📋', path: '/disciplinary' },
        { name: 'My Shifts', icon: '📅', path: '/shifts' },
      ],
    },
  ],
};

export const Sidebar = () => {
  const role = getUserRole() || 'super_admin';
  const navItems = navItemsByRole[role] || navItemsByRole.super_admin;
  const roleLabel = formatRoleLabel(role);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1>CPMS</h1>
        <span className={styles.roleBadge}>{roleLabel}</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((group) => (
          <div key={group.section}>
            <div className={styles.navSection}>{group.section}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userName}>{getUserName()}</div>
        <button
          type="button"
          className={styles.logoutLink}
          onClick={async () => {
            try {
              await fetch('/api/logout', { method: 'POST' });
            } finally {
              localStorage.removeItem('userRole');
              localStorage.removeItem('userName');
              window.location.href = '/login';
            }
          }}
        >
          ↩ Logout
        </button>
      </div>
    </aside>
  );
};
