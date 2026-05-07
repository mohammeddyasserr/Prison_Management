import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRightLeft,
  Bot,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { formatRoleLabel, getUserName, getUserRole, logout } from '../../services/authentication';

const navItemsByRole = {
  admin: [
    {
      section: 'Main',
      items: [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/superadmin' }],
    },
    {
      section: 'Administration',
      items: [
        { name: 'Prisons', icon: Building2, path: '/prisons' },
        { name: 'Staff Management', icon: UserCheck, path: '/officers' },
        { name: 'Inmates', icon: UserRound, path: '/inmates' },
        { name: 'Transfers', icon: ArrowRightLeft, path: '/transfers' },
        { name: 'Visits', icon: Users, path: '/visits' },
        { name: 'Incidents', icon: ShieldAlert, path: '/incidents' },
        { name: 'Disciplinary', icon: ClipboardList, path: '/disciplinary' },
        { name: 'Healthcare', icon: HeartPulse, path: '/healthcare' },
        { name: 'Shifts', icon: CalendarClock, path: '/shifts' },
      ],
    },
    {
      section: 'Analytics',
      items: [{ name: 'ML Predictions', icon: Bot, path: '/ml' }],
    },
  ],
  manager: [
    {
      section: 'Main',
      items: [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/manager' }],
    },
    {
      section: 'My Prison',
      items: [
        { name: 'Prison Details', icon: Building2, path: '/prisons/my' },
        { name: 'Inmates', icon: UserRound, path: '/inmates' },
        { name: 'Officers', icon: UserCheck, path: '/officers' },
      ],
    },
    {
      section: 'Operations',
      items: [
        { name: 'Transfers', icon: ArrowRightLeft, path: '/transfers' },
        { name: 'Visits', icon: Users, path: '/visits' },
        { name: 'Time Slots', icon: CalendarClock, path: '/visits/slots' },
        { name: 'Incidents', icon: ShieldAlert, path: '/incidents' },
        { name: 'Disciplinary', icon: ClipboardList, path: '/disciplinary' },
        { name: 'Healthcare', icon: HeartPulse, path: '/healthcare' },
        { name: 'Shifts', icon: CalendarDays, path: '/shifts' },
      ],
    },
    {
      section: 'Analytics',
      items: [{ name: 'ML Predictions', icon: Bot, path: '/ml' }],
    },
  ],
  officer: [
    {
      section: 'Main',
      items: [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/officer' }],
    },
    {
      section: 'My Block',
      items: [{ name: 'Inmates', icon: UserRound, path: '/inmates' }],
    },
    {
      section: 'Reporting',
      items: [
        { name: 'Incidents', icon: ShieldAlert, path: '/incidents' },
        { name: 'Disciplinary', icon: ClipboardList, path: '/disciplinary' },
        { name: 'My Shifts', icon: CalendarDays, path: '/shifts' },
      ],
    },
  ],
};

export const Sidebar = () => {
  const role = getUserRole() || 'admin';
  const navItems = navItemsByRole[role] || navItemsByRole.admin;
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
                <span className={styles.icon}>
                  <item.icon size={18} strokeWidth={1.9} />
                </span>
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
          onClick={logout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
