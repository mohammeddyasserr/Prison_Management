// authentication.js

export const getUserRole = () => localStorage.getItem('userRole') || '';

export const getUserName = () => localStorage.getItem('userName') || 'System User';

export const formatRoleLabel = (role = '') =>
  role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const hasRole = (...roles) => roles.includes(getUserRole());


export const postForm = async (path, values) => {
  const body = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => body.append(key, item));
      return;
    }

    body.append(key, value ?? '');
  });

  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response;
};
