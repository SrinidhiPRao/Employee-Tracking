// ─── Reports API ──────────────────────────────────────────────────────────────
// All endpoints under /reports on the backend.
// All these require HR or Admin role.

import api from './axios'

// Get a flat list of all employees — used by HR for payroll and overtime forms
export const getAllEmployees = () =>
  api.get('/reports/employees')

// Get a list of all departments with employee counts
export const getDepartments = () =>
  api.get('/reports/department')

// Get the list of employees inside a specific department
export const getDepartmentEmployees = (department: string) =>
  api.get(`/reports/department/${encodeURIComponent(department)}`)

// Download a CSV report — responseType 'blob' is needed for file downloads
// report_type: 'ranking' | 'summary' | 'leaves'
export const exportMasterReport = (
  reportType: 'ranking' | 'summary' | 'leaves',
  month?: number,
  year?: number
) =>
  api.get('/reports/export-master', {
    params: { report_type: reportType, month, year },
    responseType: 'blob', // tells Axios to treat the response as binary file data
  })
