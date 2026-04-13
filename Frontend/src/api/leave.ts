// ─── Leave API ────────────────────────────────────────────────────────────────
// All endpoints under /leave on the backend.

import api from './axios'

// Submit a new leave request for the logged-in employee
export const applyLeave = (data: {
  leave_type: string
  start_date: string
  end_date: string
  reason: string
}) => api.post('/leave/apply', data)

// Get all leave requests for the logged-in employee
export const getMyLeaves = () =>
  api.get('/leave/my-leaves')

// Get all employees' leave requests (Manager/HR/Admin only)
// Pass a status string to filter: 'pending' | 'approved' | 'rejected'
export const getAllLeaves = (status?: string) =>
  api.get('/leave/all-leaves', { params: status ? { status } : {} })

// Approve or reject a leave request by its ID (Manager/HR/Admin only)
export const updateLeaveStatus = (leaveId: number, status: 'approved' | 'rejected') =>
  api.put(`/leave/${leaveId}/status`, { status })
