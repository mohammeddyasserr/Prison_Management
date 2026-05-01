export const getUserRole = () => localStorage.getItem('userRole') || '';

export const getUserName = () => localStorage.getItem('userName') || 'System User';

export const formatRoleLabel = (role = '') =>
  role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const hasRole = (...roles) => roles.includes(getUserRole());
