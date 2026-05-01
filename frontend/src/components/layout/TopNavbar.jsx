import React from 'react';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './TopNavbar.module.css';

export const TopNavbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole') || 'super_admin';
  const userName = localStorage.getItem('userName') || 'Admin User';
  const roleLabel = role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.searchContainer}>
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search inmates, staff, alerts..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.badge}></span>
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{userName}</span>
            <span className={styles.profileRole}>{roleLabel}</span>
          </div>
        </div>

        <button 
          className={styles.iconButton} 
          onClick={() => {
            localStorage.removeItem('userRole');
            navigate('/login');
          }}
          title="Logout"
          style={{marginLeft: '10px', color: 'var(--color-danger)'}}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
