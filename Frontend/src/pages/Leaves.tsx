// ─── My Leaves Page ───────────────────────────────────────────────────────────
// Lets the logged-in employee apply for leave and view their leave history.

import { useState, useEffect } from 'react'
import { applyLeave, getMyLeaves } from '../api/leave'
import { getErrorMessage, getStatusBadgeClass } from '../utils/helpers'
import type { Leave } from '../types'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

// All leave types supported by the backend
const LEAVE_TYPES = ['sick', 'casual', 'earned', 'maternity', 'paternity', 'other']

// Empty state for the apply-leave form
const EMPTY_FORM = {
  leave_type: 'sick',
  start_date: '',
  end_date: '',
  reason: '',
}

export default function Leaves() {
  const [leaves, setLeaves]     = useState<Leave[]>([])
  const [form, setForm]         = useState(EMPTY_FORM)
  const [message, setMessage]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Load the user's leave history when the page first opens
  useEffect(() => {
    loadLeaves()
  }, [])

  function loadLeaves() {
    getMyLeaves()
      .then((res) => setLeaves(res.data))
      .catch(() => {})
  }

  // Called when the user submits the leave application form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      await applyLeave(form)
      setMessage('Leave applied successfully!')
      setForm(EMPTY_FORM)   // reset form fields
      setShowForm(false)    // hide the form
      loadLeaves()          // refresh the leave history table
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to apply leave'))
    } finally {
      setLoading(false)
    }
  }

  // Helper to update a single field in the form state
  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Page header with "Apply Leave" toggle button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Leaves</h1>
          <p className="text-gray-500 text-sm mt-1">View and apply for leave</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Apply Leave'}
        </button>
      </div>

      {/* Success message (shown after a successful application) */}
      {message && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      {/* Apply Leave form — only visible when the user clicks "+ Apply Leave" */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Apply for Leave</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              <XCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Leave type dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={form.leave_type}
                onChange={(e) => updateForm('leave_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) => updateForm('start_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={form.end_date}
                  onChange={(e) => updateForm('end_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reason text area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => updateForm('reason', e.target.value)}
                placeholder="Briefly describe the reason..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Leave history table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-500" />
          Leave History
        </h2>

        {leaves.length === 0 ? (
          <p className="text-sm text-gray-400">No leave records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">From</th>
                  <th className="pb-2 font-medium">To</th>
                  <th className="pb-2 font-medium">Reason</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 capitalize">{leave.leave_type}</td>
                    <td className="py-2">{leave.start_date}</td>
                    <td className="py-2">{leave.end_date}</td>
                    <td className="py-2 max-w-xs truncate text-gray-500">{leave.reason}</td>
                    <td className="py-2">
                      <span className={getStatusBadgeClass(leave.status)}>{leave.status}</span>
                    </td>
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
