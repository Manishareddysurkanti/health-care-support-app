const TOKEN_KEY = 'carebridge_staff_token';
const STAFF_KEY = 'carebridge_staff_info';

export function getStaffToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStaffInfo() {
  const raw = localStorage.getItem(STAFF_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStaffSession(token, staff) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

export function clearStaffSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STAFF_KEY);
}

export function staffAuthHeaders() {
  const token = getStaffToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
