// ─── Global TypeScript Types ──────────────────────────────────────────────────
// Shared type definitions used across the entire frontend.
// These mirror the data shapes returned by the FastAPI backend.

// ── Roles ──────────────────────────────────────────────────────────────────
// Must match the ENUM('employee', 'manager', 'hr', 'admin') in the database
export type Role = 'employee' | 'manager' | 'hr' | 'admin'

// ── Auth Store ─────────────────────────────────────────────────────────────
// Shape of the Zustand auth store state + actions
export interface AuthState {
  token:           string | null
  role:            Role | null
  name:            string | null
  isAuthenticated: boolean
  login:  (token: string, role: Role, name: string) => void
  logout: () => void
}

// ── Leave ──────────────────────────────────────────────────────────────────
// A single leave request record from the API
export interface Leave {
  id:            number
  employee_id:   number
  employee_name?: string   // only included in all-leaves (admin/manager view)
  department?:   string    // only included in all-leaves (admin/manager view)
  leave_type:    string
  start_date:    string
  end_date:      string
  reason:        string
  status:        'pending' | 'approved' | 'rejected'
  applied_at:    string
}

// ── Attendance ─────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id:               number
  employee_id:      number
  employee_name?:   string
  department?:      string
  date:             string
  check_in:         string
  check_out?:       string
  overtime_hours?:  number
  status:           string
}

// ── Payroll ────────────────────────────────────────────────────────────────
export interface PayrollRecord {
  id:              number
  employee_id:     number
  month:           number
  year:            number
  basic_salary:    number
  deductions:      number
  overtime_hours:  number
  overtime_pay:    number
  net_salary:      number
}

// ── Reports ────────────────────────────────────────────────────────────────
export interface MonthlyReport {
  employee_id:          number
  employee_name:        string
  department:           string
  month:                number
  year:                 number
  total_days_present:   number
  total_overtime_hours: number
}

export interface Department {
  department:       string
  total_employees:  number
}
