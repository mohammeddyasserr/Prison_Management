import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, LockKeyhole, UserRound } from 'lucide-react';
import styles from './Login.module.css';
import { postForm } from '../../services/authentication';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const userId = identifier.trim();

    try {
      const response = await postForm('/login/token', {
        username: userId,
        password: password
      });

      const data = await response.json();

      // Store user info in localStorage (matching authentication.js keys)
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userToken', data.access_token);
      localStorage.setItem('userNationalId', data.access_token); // access_token IS the national_id in this simplified setup
      localStorage.setItem('userName', data.name || 'System User');
      if (data.prison_id) {
        localStorage.setItem('prison_id', data.prison_id);
      }

      toast.success('Login Successful', `Welcome back, ${data.name || 'User'}`);

      // Navigate based on role
      if (data.role === 'admin') {
        navigate('/dashboard/superadmin');
      } else if (data.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/officer');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.lightTube} aria-hidden="true" />
      <div className={styles.lightCone} aria-hidden="true" />
      <div className={styles.scratchField} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <span key={i} />)}
      </div>
      <div className={`${styles.barStack} ${styles.leftBars}`} aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => <span key={i} />)}
      </div>
       <div className={`${styles.barStack} ${styles.rightBars}`} aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => <span key={i} />)}
      </div>

      <div className={styles.loginCard}>
        <div className={styles.cardPin} aria-hidden="true" />
        <div className={styles.metaLabel}>Secure Access Ledger</div>
        <h1>CPMS</h1>
        <p className={styles.subtitle}>Centralized Prison Management System</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="national_id">Username / Email / National ID</label>
            <div className={styles.inputShell}>
              <UserRound size={18} />
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
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputShell}>
              <LockKeyhole size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.loginButton}>
            <span>Sign In</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.portalLink}>
          <Link to="/visit-request">
            <CalendarDays size={16} />
            <span>Public Visit Request Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
