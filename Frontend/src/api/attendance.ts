// ─── Attendance API ───────────────────────────────────────────────────────────
// All endpoints under /attendance on the backend.

import api from './axios'

// Mark today's check-in for the logged-in employee
export const markAttendance = () =>
  api.post('/attendance/mark')

// Mark today's check-out for the logged-in employee
export const checkout = () =>
  api.post('/attendance/checkout')

// Get the late-arrival history for the logged-in employee
export const getMyLateMark = () =>
  api.get('/attendance/late-mark/me')

// Get late-arrival history for all employees (HR/Admin only)
export const getAllLateMarks = () =>
  api.get('/attendance/late-mark/all')

// Get overtime summary for a specific employee and month (HR/Admin only)
export const getOvertimeSummary = (employeeId: number, month: number, year: number) =>
  api.get(`/attendance/overtime/${employeeId}`, { params: { month, year } })

// Get monthly attendance report for all employees (HR/Admin only)
export const getMonthlyReport = () =>
  api.get('/attendance/report/monthly')
