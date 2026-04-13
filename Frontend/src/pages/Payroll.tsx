// ─── My Payroll Page (US-07) ──────────────────────────────────────────────────
// Shows the logged-in employee's full salary history.
// Each row has a "View Slip" button that opens a printable salary slip modal.

import { useState, useEffect } from 'react'
import { getMyPayroll } from '../api/payroll'
import { useAuthStore } from '../store/authStore'
import { MONTHS } from '../utils/helpers'
import type { PayrollRecord } from '../types'
import { DollarSign, X, Printer } from 'lucide-react'

export default function Payroll() {
  const { name } = useAuthStore()
  const [records, setRecords]       = useState<PayrollRecord[]>([])
  const [loading, setLoading]       = useState(true)

  // The record currently shown in the salary slip modal (null = modal closed)
  const [slipRecord, setSlipRecord] = useState<PayrollRecord | null>(null)

  useEffect(() => {
    getMyPayroll()
      .then((res) => setRecords(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Payroll</h1>
        <p className="text-gray-500 text-sm mt-1">Your salary history</p>
      </div>

      {/* Payroll table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-green-500" />
          Payroll Records
        </h2>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-400">No payroll records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Basic Salary</th>
                  <th className="pb-2 font-medium">Deductions</th>
                  <th className="pb-2 font-medium">OT Hours</th>
                  <th className="pb-2 font-medium">OT Pay</th>
                  <th className="pb-2 font-medium text-green-600">Net Salary</th>
                  <th className="pb-2 font-medium">Slip</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium">
                      {MONTHS[record.month - 1]} {record.year}
                    </td>
                    <td className="py-2">₹{record.basic_salary.toLocaleString()}</td>
                    <td className="py-2 text-red-500">-₹{record.deductions.toLocaleString()}</td>
                    <td className="py-2">{record.overtime_hours}h</td>
                    <td className="py-2 text-blue-500">+₹{record.overtime_pay.toLocaleString()}</td>
                    <td className="py-2 font-semibold text-green-600">
                      ₹{record.net_salary.toLocaleString()}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => setSlipRecord(record)}
                        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        <Printer size={12} /> View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Slip Modal (US-07) */}
      {slipRecord && (
        <SalarySlipModal
          record={slipRecord}
          employeeName={name ?? 'Employee'}
          onClose={() => setSlipRecord(null)}
        />
      )}

    </div>
  )
}

// ─── Salary Slip Modal ────────────────────────────────────────────────────────
// A printable salary slip shown in a modal overlay.
// The "Print" button uses the browser's built-in print dialog.

interface SalarySlipModalProps {
  record: PayrollRecord
  employeeName: string
  onClose: () => void
}

function SalarySlipModal({ record, employeeName, onClose }: SalarySlipModalProps) {
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    // Dark overlay behind the modal
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Modal header with close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Salary Slip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Slip content — this section gets printed */}
        <div id="salary-slip-content" className="px-6 py-5 space-y-4">

          {/* Company + period */}
          <div className="text-center border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-blue-700">EMS</h3>
            <p className="text-xs text-gray-500">Employee Management System</p>
            <p className="text-sm font-semibold text-gray-700 mt-2">
              Salary Slip — {MONTHS[record.month - 1]} {record.year}
            </p>
          </div>

          {/* Employee info */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee Name</span>
              <span className="font-medium">{employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employee ID</span>
              <span className="font-medium">#{record.employee_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pay Period</span>
              <span className="font-medium">{MONTHS[record.month - 1]} {record.year}</span>
            </div>
          </div>

          {/* Earnings & deductions breakdown */}
          <div className="border border-gray-100 rounded-lg overflow-hidden text-sm">
            <div className="bg-gray-50 px-4 py-2 font-medium text-gray-600 text-xs uppercase tracking-wide">
              Earnings
            </div>
            <div className="px-4 py-2 flex justify-between border-b border-gray-50">
              <span className="text-gray-600">Basic Salary</span>
              <span>₹{record.basic_salary.toLocaleString()}</span>
            </div>
            <div className="px-4 py-2 flex justify-between">
              <span className="text-gray-600">Overtime Pay ({record.overtime_hours}h)</span>
              <span className="text-blue-600">+₹{record.overtime_pay.toLocaleString()}</span>
            </div>

            <div className="bg-gray-50 px-4 py-2 font-medium text-gray-600 text-xs uppercase tracking-wide border-t border-gray-100">
              Deductions
            </div>
            <div className="px-4 py-2 flex justify-between">
              <span className="text-gray-600">Absent Day Deductions</span>
              <span className="text-red-500">-₹{record.deductions.toLocaleString()}</span>
            </div>

            {/* Net salary total */}
            <div className="bg-green-50 px-4 py-3 flex justify-between border-t border-green-100">
              <span className="font-bold text-gray-800">Net Salary</span>
              <span className="font-bold text-green-600 text-base">
                ₹{record.net_salary.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Generated on {generatedDate}
          </p>
        </div>

        {/* Print button */}
        <div className="px-6 pb-5">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            <Printer size={16} />
            Print Salary Slip
          </button>
        </div>

      </div>
    </div>
  )
}
