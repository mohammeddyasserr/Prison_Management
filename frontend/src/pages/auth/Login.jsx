import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { postForm } from '../../lib/http';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
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

      // Store user info in localStorage
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userNationalId', data.access_token);
      localStorage.setItem('token', data.access_token);

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

        <div className={styles.portalLink}>
          <Link to="/visit-request">Public Visit Request Portal →</Link>
        </div>
      </div>
    </div>
  );
};

