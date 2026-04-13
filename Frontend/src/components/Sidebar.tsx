// ─── Sidebar Navigation ───────────────────────────────────────────────────────
// Shows only the nav items the logged-in user's role is allowed to see.

import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  Clock,
  Calendar,
  DollarSign,
  BarChart2,
  Users,
  FileDown,
  ClipboardList,
  Calculator,
  Timer,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  roles: string[]  // which roles can see this item
}

const NAV_ITEMS: NavItem[] = [
  // All roles
  { to: '/dashboard',  label: 'Dashboard',       icon: <LayoutDashboard size={18} />, roles: ['employee', 'manager', 'hr', 'admin'] },
  { to: '/attendance', label: 'Attendance',       icon: <Clock size={18} />,           roles: ['employee', 'manager', 'hr', 'admin'] },
  { to: '/leaves',     label: 'My Leaves',        icon: <Calendar size={18} />,        roles: ['employee', 'manager', 'hr', 'admin'] },
  { to: '/payroll',    label: 'My Payroll',        icon: <DollarSign size={18} />,      roles: ['employee', 'manager', 'hr', 'admin'] },

  // Manager, HR, Admin
  { to: '/manage-leaves',   label: 'Manage Leaves',   icon: <ClipboardList size={18} />, roles: ['manager', 'hr', 'admin'] },

  // HR and Admin only
  { to: '/payroll-manager', label: 'Payroll Manager',  icon: <Calculator size={18} />,   roles: ['hr', 'admin'] },
  { to: '/overtime-report', label: 'Overtime Report',  icon: <Timer size={18} />,         roles: ['hr', 'admin'] },
  { to: '/monthly-report',  label: 'Monthly Report',   icon: <BarChart2 size={18} />,     roles: ['hr', 'admin'] },
  { to: '/departments',     label: 'Departments',      icon: <Users size={18} />,          roles: ['hr', 'admin'] },
  { to: '/export',          label: 'Export Reports',   icon: <FileDown size={18} />,       roles: ['hr', 'admin'] },
]

export default function Sidebar() {
  const { role } = useAuthStore()

  // Only show items the current role is allowed to access
  const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role))

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-gray-300 flex flex-col py-6 px-3 gap-1 shrink-0">
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
