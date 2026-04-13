// ─── Manage Leaves Page ───────────────────────────────────────────────────────
// For managers, HR, and admins only.
// Shows all employee leave requests and allows approving or rejecting them.

import { useState, useEffect } from 'react'
import { getAllLeaves, updateLeaveStatus } from '../api/leave'
import { getErrorMessage, getStatusBadgeClass } from '../utils/helpers'
import type { Leave } from '../types'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ManageLeaves() {
  const [leaves, setLeaves]       = useState<Leave[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')  // '' means show all
  const [actionMessage, setActionMessage] = useState('')
  const [loading, setLoading]     = useState(false)

  // Re-fetch leaves whenever the status filter changes
  useEffect(() => {
    loadLeaves()
  }, [statusFilter])

  function loadLeaves() {
    // Pass undefined if no filter is selected (API returns all leaves)
    getAllLeaves(statusFilter || undefined)
      .then((res) => {
        setLeaves(res.data.data)
        setTotalCount(res.data.total_records)
      })
      .catch(() => {})
  }

  // Approves or rejects a leave request by its ID
  async function handleAction(leaveId: number, status: 'approved' | 'rejected') {
    setLoading(true)
    setActionMessage('')

    try {
      await updateLeaveStatus(leaveId, status)
      setActionMessage(`Leave ${status} successfully`)
      loadLeaves() // refresh the list
    } catch (err) {
      setActionMessage(getErrorMessage(err, 'Action failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Leaves</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and approve or reject employee leave requests
        </p>
      </div>

      {/* Feedback message after approve/reject action */}
      {actionMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
          {actionMessage}
        </div>
      )}

      {/* Leave requests table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        {/* Table header with record count and filter dropdown */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">
            Leave Requests{' '}
            <span className="text-gray-400 font-normal text-sm">({totalCount} total)</span>
          </h2>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {leaves.length === 0 ? (
          <p className="text-sm text-gray-400">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Dept</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">From</th>
                  <th className="pb-2 font-medium">To</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium">{leave.employee_name}</td>
                    <td className="py-2 text-gray-500">{leave.department}</td>
                    <td className="py-2 capitalize">{leave.leave_type}</td>
                    <td className="py-2">{leave.start_date}</td>
                    <td className="py-2">{leave.end_date}</td>
                    <td className="py-2">
                      <span className={getStatusBadgeClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {/* Only show action buttons for pending requests */}
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(leave.id, 'approved')}
                            disabled={loading}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(leave.id, 'rejected')}
                            disabled={loading}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
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
