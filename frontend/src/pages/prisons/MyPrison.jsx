import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export const MyPrison = () => {
  const [prisonId, setPrisonId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPrison = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const nationalId = localStorage.getItem('userNationalId') || '';
        const headers = { 'Authorization': `Bearer ${token}` };

        // Try the dedicated user prison endpoint first
        const res = await fetch(`/api/prison/user/${nationalId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.prison_id) {
            setPrisonId(data.prison_id);
            return;
          }
        }

        // Fallback: fetch all prisons and find by manager_id
        const res2 = await fetch('/api/prison', { headers });
        const all = await res2.json();
        const prisons = Array.isArray(all) ? all : [all];
        const mine = prisons.find(p => String(p.manager_id) === String(nationalId));
        if (mine) {
          setPrisonId(mine.prison_id);
        } else {
          setPrisonId(-1);
        }
      } catch (err) {
        console.error('Error fetching prison:', err);
        setPrisonId(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPrison();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#e2e8f0' }}>Loading Prison...</div>;
  if (!prisonId || prisonId === -1) return <Navigate to="/prisons" replace />;

  return <Navigate to={`/prisons/${prisonId}`} replace />;
};
