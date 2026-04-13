// ─── Dashboard Page (US-08) ───────────────────────────────────────────────────
// Shows a personalised overview based on the logged-in user's role.
//
// Employee  → my pending leaves, my late count, my latest salary
// Manager   → pending leave requests waiting for action
// HR/Admin  → total employees, pending leaves, current month attendance stats

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getMyLeaves } from '../api/leave'
import { getMyLateMark } from '../api/attendance'
import { getMyPayroll } from '../api/payroll'
import { getAllLeaves } from '../api/leave'
import { getDepartments } from '../api/reports'
import { getMonthlyReport } from '../api/attendance'
import { Clock, Calendar, DollarSign, Users, BarChart2, AlertTriangle } from 'lucide-react'

// ─── Stat Card Component ──────────────────────────────────────────────────────
// Small card that shows a single number with a label and icon.

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`${color} text-white p-3 rounded-lg shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  )
}

// ─── Quick Link Card Component ────────────────────────────────────────────────

interface QuickCard {
  title: string
  description: string
  icon: React.ReactNode
  to: string
  color: string
  roles: string[]
}

const QUICK_CARDS: QuickCard[] = [
  {
    title: 'Mark Attendance',
    description: 'Check in or check out for today',
    icon: <Clock size={22} />,
    to: '/attendance',
    color: 'bg-blue-500',
    roles: ['employee', 'manager', 'hr', 'admin'],
  },
  {
    title: 'My Leaves',
    description: 'Apply or view your leave requests',
    icon: <Calendar size={22} />,
    to: '/leaves',
    color: 'bg-green-500',
    roles: ['employee', 'manager', 'hr', 'admin'],
  },
  {
    title: 'My Payroll',
    description: 'View salary slips and history',
    icon: <DollarSign size={22} />,
    to: '/payroll',
    color: 'bg-yellow-500',
    roles: ['employee', 'manager', 'hr', 'admin'],
  },
  {
    title: 'Manage Leaves',
    description: 'Approve or reject leave requests',
    icon: <Users size={22} />,
    to: '/manage-leaves',
    color: 'bg-orange-500',
    roles: ['manager', 'hr', 'admin'],
  },
  {
    title: 'Payroll Manager',
    description: 'Calculate payroll for employees',
    icon: <DollarSign size={22} />,
    to: '/payroll-manager',
    color: 'bg-purple-500',
    roles: ['hr', 'admin'],
  },
  {
    title: 'Monthly Report',
    description: 'Attendance summary by month',
    icon: <BarChart2 size={22} />,
    to: '/monthly-report',
    color: 'bg-teal-500',
    roles: ['hr', 'admin'],
  },
]

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function Dashboard() {
  const { name, role } = useAuthStore()

  // Stats shown at the top of the dashboard
  const [stats, setStats] = useState({
    pendingLeaves:    0,
    lateCount:        0,
    latestSalary:     0,
    totalEmployees:   0,
    presentThisMonth: 0,
  })

  useEffect(() => {
    loadStats()
  }, [role])

  async function loadStats() {
    // ── Employee stats ──────────────────────────────────────────────────────
    if (role === 'employee' || role === 'manager') {
      // Count the employee's own pending leaves
      getMyLeaves()
        .then((res) => {
          const pending = res.data.filter((l: { status: string }) => l.status === 'pending').length
          setStats((prev) => ({ ...prev, pendingLeaves: pending }))
        })
        .catch(() => {})

      // Count personal late arrivals
      getMyLateMark()
        .then((res) => {
          setStats((prev) => ({ ...prev, lateCount: res.data.total_late_records }))
        })
        .catch(() => {})

      // Get the latest net salary
      getMyPayroll()
        .then((res) => {
          if (res.data.length > 0) {
            setStats((prev) => ({ ...prev, latestSalary: res.data[0].net_salary }))
          }
        })
        .catch(() => {})
    }

    // ── HR / Admin stats ────────────────────────────────────────────────────
    if (role === 'hr' || role === 'admin') {
      // Total number of employees across all departments
      getDepartments()
        .then((res) => {
          const total = res.data.departments.reduce(
            (sum: number, d: { total_employees: number }) => sum + d.total_employees,
            0
          )
          setStats((prev) => ({ ...prev, totalEmployees: total }))
        })
        .catch(() => {})

      // Count all pending leave requests
      getAllLeaves('pending')
        .then((res) => {
          setStats((prev) => ({ ...prev, pendingLeaves: res.data.total_records }))
        })
        .catch(() => {})

      // Count how many employees have attended this month
      getMonthlyReport()
        .then((res) => {
          const currentMonth = new Date().getMonth() + 1
          const currentYear  = new Date().getFullYear()
          const thisMonth = res.data.data.filter(
            (r: { month: number; year: number }) =>
              r.month === currentMonth && r.year === currentYear
          )
          setStats((prev) => ({ ...prev, presentThisMonth: thisMonth.length }))
        })
        .catch(() => {})
    }

    // Manager also needs pending leaves count
    if (role === 'manager') {
      getAllLeaves('pending')
        .then((res) => {
          setStats((prev) => ({ ...prev, pendingLeaves: res.data.total_records }))
        })
        .catch(() => {})
    }
  }

  const filteredCards = QUICK_CARDS.filter((c) => role && c.roles.includes(role))

  return (
    <div className="space-y-8">

      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {name}!</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">Role: {role}</p>
      </div>

      {/* ── Stats section ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Employee: pending leaves */}
          {(role === 'employee' || role === 'manager') && (
            <StatCard
              label="My Pending Leaves"
              value={stats.pendingLeaves}
              icon={<Calendar size={20} />}
              color="bg-green-500"
            />
          )}

          {/* Employee: late count */}
          {role === 'employee' && (
            <StatCard
              label="Late Arrivals"
              value={stats.lateCount}
              icon={<AlertTriangle size={20} />}
              color="bg-yellow-500"
            />
          )}

          {/* Employee: latest salary */}
          {role === 'employee' && stats.latestSalary > 0 && (
            <StatCard
              label="Latest Net Salary"
              value={`₹${stats.latestSalary.toLocaleString()}`}
              icon={<DollarSign size={20} />}
              color="bg-blue-500"
            />
          )}

          {/* Manager: pending leaves to action */}
          {role === 'manager' && (
            <StatCard
              label="Pending Leave Requests"
              value={stats.pendingLeaves}
              icon={<Users size={20} />}
              color="bg-orange-500"
            />
          )}

          {/* HR/Admin: total employees */}
          {(role === 'hr' || role === 'admin') && (
            <StatCard
              label="Total Employees"
              value={stats.totalEmployees}
              icon={<Users size={20} />}
              color="bg-blue-500"
            />
          )}

          {/* HR/Admin: pending leaves */}
          {(role === 'hr' || role === 'admin') && (
            <StatCard
              label="Pending Leave Requests"
              value={stats.pendingLeaves}
              icon={<Calendar size={20} />}
              color="bg-orange-500"
            />
          )}

          {/* HR/Admin: present this month */}
          {(role === 'hr' || role === 'admin') && (
            <StatCard
              label="Active Employees This Month"
              value={stats.presentThisMonth}
              icon={<BarChart2 size={20} />}
              color="bg-teal-500"
            />
          )}

        </div>
      </div>

      {/* ── Quick links section ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`${card.color} text-white p-3 rounded-lg shrink-0`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{card.title}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
