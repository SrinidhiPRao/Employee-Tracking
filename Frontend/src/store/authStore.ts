// ─── Auth Store ───────────────────────────────────────────────────────────────
// Global state for the logged-in user using Zustand.
//
// `persist` saves the state to localStorage so the user stays logged in
// even after refreshing the browser.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, Role } from '../types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state — no user logged in
      token:           null,
      role:            null,
      name:            null,
      isAuthenticated: false,

      // Called after a successful login to save credentials
      login: (token: string, role: Role, name: string) =>
        set({ token, role, name, isAuthenticated: true }),

      // Called on logout — clears all credentials
      logout: () =>
        set({ token: null, role: null, name: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' } // key used in localStorage
  )
)
