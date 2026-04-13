// ─── Payroll API ──────────────────────────────────────────────────────────────
// All endpoints under /payroll on the backend.

import api from './axios'

// Calculate and save payroll for a specific employee and month (HR/Admin only)
export const calculatePayroll = (data: {
  employee_id: number
  month: number
  year: number
}) => api.post('/payroll/calculate', data)

// Get the salary history for the logged-in employee
export const getMyPayroll = () =>
  api.get('/payroll/my-payroll')
