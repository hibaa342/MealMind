const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export function getApiBase() {
  return API_BASE
}

export function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
      }
    : {}
}
