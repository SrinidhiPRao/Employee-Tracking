// ─── Payroll Manager Page (US-06) ────────────────────────────────────────────
// For HR and Admin only.
// Lets HR select an employee, pick a month/year, and calculate their payroll.
// The result is saved to the database and shown instantly.

import { useState, useEffect } from 'react'
import { getAllEmployees } from '../../api/reports'
import { calculatePayroll } from '../../api/payroll'
import { getErrorMessage, MONTHS } from '../../utils/helpers'
import { DollarSign, Calculator } from 'lucide-react'

// Shape of each employee from the /reports/employees endpoint
interface Employee {
  id: number
  name: string
  department: string
  role: string
}

// Shape of the payroll result returned after calculation
interface PayrollResult {
  employee_id: number
  month: number
  year: number
  basic_salary: number
  deductions: number
  overtime_hours: number
  overtime_pay: number
  net_salary: number
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - i)

export default function PayrollManager() {
  const [employees, setEmployees]       = useState<Employee[]>([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [month, setMonth]               = useState(new Date().getMonth() + 1)
  const [year, setYear]                 = useState(CURRENT_YEAR)
  const [result, setResult]             = useState<PayrollResult | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  // Load employee list when the page opens
  useEffect(() => {
    getAllEmployees()
      .then((res) => setEmployees(res.data.employees))
      .catch(() => {})
  }, [])

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await calculatePayroll({
        employee_id: parseInt(selectedEmpId),
        month,
        year,
      })
      setResult(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Payroll calculation failed'))
    } finally {
      setLoading(false)
    }
  }

  // Find the selected employee's name for display
  const selectedEmployee = employees.find((e) => e.id === parseInt(selectedEmpId))

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payroll Manager</h1>
        <p className="text-gray-500 text-sm mt-1">
          Calculate monthly salary for any employee
        </p>
      </div>

      {/* Payroll calculation form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-blue-500" />
          Calculate Payroll
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCalculate} className="space-y-4">

          {/* Employee selector */}
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

          {/* Month and Year selectors */}
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
            {loading ? 'Calculating...' : 'Calculate Payroll'}
          </button>
        </form>
      </div>

      {/* Result card — shown after a successful calculation */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <DollarSign size={18} className="text-green-500" />
            Payroll Result
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            {selectedEmployee?.name} — {MONTHS[result.month - 1]} {result.year}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-600">Basic Salary</span>
              <span className="font-medium">₹{result.basic_salary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-600">Deductions (absent days)</span>
              <span className="font-medium text-red-500">-₹{result.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-600">Overtime ({result.overtime_hours}h)</span>
              <span className="font-medium text-blue-500">+₹{result.overtime_pay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-gray-800">Net Salary</span>
              <span className="font-bold text-green-600 text-base">
                ₹{result.net_salary.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
