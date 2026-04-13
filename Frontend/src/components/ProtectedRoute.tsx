import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface Props {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
