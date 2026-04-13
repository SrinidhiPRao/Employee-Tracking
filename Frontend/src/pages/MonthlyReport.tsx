import { useState, useEffect } from 'react'
import { getMonthlyReport } from '../api/attendance'
import type { MonthlyReport } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { BarChart2 } from 'lucide-react'
import { MONTHS_SHORT } from '../utils/helpers'

export default function MonthlyReportPage() {
  const [data, setData] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    getMonthlyReport()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter((d) => {
    if (filterMonth && d.month !== parseInt(filterMonth)) return false
    if (filterYear && d.year !== parseInt(filterYear)) return false
    return true
  })

  const chartData = filtered.slice(0, 10).map((d) => ({
    name: d.employee_name?.split(' ')[0],
    days: d.total_days_present,
    overtime: d.total_overtime_hours ?? 0,
  }))

  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Monthly Attendance Report</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of employee attendance by month</p>
      </div>

      <div className="flex gap-3">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Months</option>
          {MONTHS_SHORT.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-500" />
            Days Present (Top 10)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="days" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Days Present" />
              <Bar dataKey="overtime" fill="#10b981" radius={[4, 4, 0, 0]} name="OT Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Attendance Data</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium">Month/Year</th>
                  <th className="pb-2 font-medium">Days Present</th>
                  <th className="pb-2 font-medium">OT Hours</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium">{r.employee_name}</td>
                    <td className="py-2 text-gray-500">{r.department}</td>
                    <td className="py-2">{MONTHS_SHORT[r.month - 1]} {r.year}</td>
                    <td className="py-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {r.total_days_present} days
                      </span>
                    </td>
                    <td className="py-2">{r.total_overtime_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
