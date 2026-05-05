import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from '../components/common/Toast.module.css';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((current) => [...current, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    info: (title, message) => addToast('info', title, message),
    warning: (title, message) => addToast('warning', title, message),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="#10b981" />;
      case 'error': return <AlertCircle size={20} color="#ef4444" />;
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
      default: return <Info size={20} color="#3b82f6" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[`toast${t.type.charAt(0).toUpperCase() + t.type.slice(1)}`]}`} onClick={() => removeToast(t.id)}>
            <div className={styles.toastIcon}>{getIcon(t.type)}</div>
            <div className={styles.toastContent}>
              <div className={styles.toastTitle}>{t.title}</div>
              {t.message && <div className={styles.toastMessage}>{t.message}</div>}
            </div>
            <button className={styles.toastClose} onClick={(e) => { e.stopPropagation(); removeToast(t.id); }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
