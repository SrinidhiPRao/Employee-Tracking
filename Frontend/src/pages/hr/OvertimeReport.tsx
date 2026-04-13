// ─── Overtime Report Page (US-11) ────────────────────────────────────────────
// For HR and Admin only.
// HR selects an employee + month/year to view their overtime breakdown.

import { useState, useEffect } from 'react'
import { getAllEmployees } from '../../api/reports'
import { getOvertimeSummary } from '../../api/attendance'
import { getErrorMessage, MONTHS } from '../../utils/helpers'
import { Clock } from 'lucide-react'

interface Employee {
  id: number
  name: string
  department: string
}

interface OvertimeDay {
  date: string
  check_in: string
  check_out: string
  overtime_hours: number
}

interface OvertimeSummary {
  employee_id: number
  employee_name: string
  month: number
  year: number
  total_overtime_hours: number
  breakdown: OvertimeDay[]
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - i)

export default function OvertimeReport() {
  const [employees, setEmployees]         = useState<Employee[]>([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [month, setMonth]                 = useState(new Date().getMonth() + 1)
  const [year, setYear]                   = useState(CURRENT_YEAR)
  const [summary, setSummary]             = useState<OvertimeSummary | null>(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  // Load employee list on page open
  useEffect(() => {
    getAllEmployees()
      .then((res) => setEmployees(res.data.employees))
      .catch(() => {})
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSummary(null)
    setLoading(true)

    try {
      const res = await getOvertimeSummary(parseInt(selectedEmpId), month, year)
      setSummary(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch overtime data'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Overtime Report</h1>
        <p className="text-gray-500 text-sm mt-1">
          View overtime hours for any employee by month
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-500" />
          Select Employee & Period
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS.map((name, index) => (
                  <option key={index} value={index + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedEmpId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Loading...' : 'View Overtime'}
          </button>
        </form>
      </div>

      {/* Overtime result */}
      {summary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">

          {/* Summary header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-700">{summary.employee_name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {MONTHS[summary.month - 1]} {summary.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_overtime_hours}h
              </p>
              <p className="text-xs text-gray-400">total overtime</p>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          {summary.breakdown.length === 0 ? (
            <p className="text-sm text-gray-400">No overtime recorded for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Check-In</th>
                    <th className="pb-2 font-medium">Check-Out</th>
                    <th className="pb-2 font-medium">Overtime Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.breakdown.map((day, index) => (
                    <tr key={index} className="border-b border-gray-50 last:border-0">
                      <td className="py-2">{day.date}</td>
                      <td className="py-2">{new Date(day.check_in).toLocaleTimeString()}</td>
                      <td className="py-2">
                        {day.check_out
                          ? new Date(day.check_out).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td className="py-2 font-medium text-blue-600">
                        {day.overtime_hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
