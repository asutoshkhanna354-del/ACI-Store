const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('ff_token');
}

function setToken(token) {
  localStorage.setItem('ff_token', token);
}

function clearToken() {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');
}

function getUser() {
  const u = localStorage.getItem('ff_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('ff_user', JSON.stringify(user));
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export { getToken, setToken, clearToken, getUser, setUser, apiFetch };
