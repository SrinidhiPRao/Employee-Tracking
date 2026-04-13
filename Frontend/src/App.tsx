// ─── App Router ───────────────────────────────────────────────────────────────
// Defines all routes in the application.
// Protected routes require login. Some are further restricted by role.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login          from './pages/auth/Login'
import Signup         from './pages/auth/Signup'
import Layout         from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard      from './pages/Dashboard'
import Attendance     from './pages/Attendance'
import Leaves         from './pages/Leaves'
import Payroll        from './pages/Payroll'
import ManageLeaves   from './pages/ManageLeaves'
import MonthlyReport  from './pages/MonthlyReport'
import Departments    from './pages/Departments'
import ExportReports  from './pages/ExportReports'
import PayrollManager from './pages/hr/PayrollManager'
import OvertimeReport from './pages/hr/OvertimeReport'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes — no login required */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected layout — all pages inside here require login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Available to all roles */}
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves"     element={<Leaves />} />
          <Route path="payroll"    element={<Payroll />} />

          {/* Manager, HR, Admin only */}
          <Route
            path="manage-leaves"
            element={
              <ProtectedRoute allowedRoles={['manager', 'hr', 'admin']}>
                <ManageLeaves />
              </ProtectedRoute>
            }
          />

          {/* HR and Admin only */}
          <Route
            path="monthly-report"
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <MonthlyReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments"
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="export"
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <ExportReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="payroll-manager"
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <PayrollManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="overtime-report"
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <OvertimeReport />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback — unknown URLs go to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
