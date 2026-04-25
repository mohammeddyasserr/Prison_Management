import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

// ── Hardcoded Users (no backend/database required) ──
const HARDCODED_USERS = {
  // Super Admin
  'ADMIN001': {
    password: 'admin123',
    name: 'System Administrator',
    role: 'super_admin'
  },
  // Prison Managers
  'MGR001': {
    password: 'manager123',
    name: 'Ahmed Hassan',
    role: 'prison_manager'
  },
  'MGR002': {
    password: 'manager123',
    name: 'Fatima Ali',
    role: 'prison_manager'
  },
  // Officers
  'OFF001': {
    password: 'officer123',
    name: 'Mohamed Youssef',
    role: 'officer'
  },
  'OFF002': {
    password: 'officer123',
    name: 'Sara Ibrahim',
    role: 'officer'
  },
  'OFF003': {
    password: 'officer123',
    name: 'Omar Khaled',
    role: 'officer'
  },
};

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const userId = identifier.trim().toUpperCase();
    const user = HARDCODED_USERS[userId];

    if (!user || user.password !== password) {
      setError('Invalid credentials. Please try again.');
      return;
    }

    // Store user info in localStorage
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userNationalId', userId);

    // Navigate based on role
    if (user.role === 'super_admin') {
      navigate('/dashboard/superadmin');
    } else if (user.role === 'prison_manager') {
      navigate('/dashboard/manager');
    } else {
      navigate('/dashboard/officer');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1>CPMS</h1>
        <p className={styles.subtitle}>Centralized Prison Management System</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="national_id">Username / Email / National ID</label>
            <input
              id="national_id"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter username, email, or National ID"
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>Sign In</button>
        </form>

        <div className={styles.demoHint}>
          Demo: <strong>ADMIN001</strong> / <strong>admin123</strong>
        </div>
        <div className={styles.portalLink}>
          <Link to="/visit-request">Public Visit Request Portal →</Link>
        </div>
      </div>
    </div>
  );
};
