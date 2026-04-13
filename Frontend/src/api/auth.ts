// ─── Auth API ────────────────────────────────────────────────────────────────
// Handles login and signup requests.
// These are the only endpoints that do NOT require a token.

import api from './axios'

// Log in with email + password → returns { access_token, role, name }
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

// Create a new employee account
export const signup = (data: {
  name: string
  email: string
  password: string
  role: string
  department: string
}) => api.post('/auth/signup', data)
