// ─── Axios Instance ───────────────────────────────────────────────────────────
// Creates a pre-configured Axios instance used by all API files.
//
// Two interceptors are set up:
//   1. Request  → automatically attaches the JWT token to every request header
//   2. Response → redirects to /login if the server returns 401 (token expired)

import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// In development: Vite proxy forwards /api/* to localhost:8000
// In production:  set VITE_API_URL to your Azure App Service URL
//   e.g. VITE_API_URL=https://your-app.azurewebsites.net
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
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
