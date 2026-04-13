// ─── Axios Instance ───────────────────────────────────────────────────────────
// Creates a pre-configured Axios instance used by all API files.
//
// Two interceptors are set up:
//   1. Request  → automatically attaches the JWT token to every request header
//   2. Response → redirects to /login if the server returns 401 (token expired)

import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api', // proxied to http://localhost:8000 by Vite (see vite.config.ts)
})

// Attach the Bearer token before every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiry — log the user out and send them to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
