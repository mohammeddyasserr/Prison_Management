import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });
      const result = await response.json();

      if (result.success) {
        localStorage.setItem('userRole', result.role);
        localStorage.setItem('userName', result.name);
        localStorage.setItem('userNationalId', result.national_id);
        if (result.role === 'super_admin') navigate('/dashboard/superadmin');
        else if (result.role === 'prison_manager') navigate('/dashboard/manager');
        else navigate('/dashboard/officer');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Connection error. Please try again.');
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
