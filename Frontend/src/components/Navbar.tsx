import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { name, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-wide">EMS</span>
        <span className="text-blue-200 text-sm hidden sm:block">Employee Tracking System</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-blue-200" />
          <span className="text-sm font-medium">{name}</span>
          <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full capitalize">{role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  )
}
