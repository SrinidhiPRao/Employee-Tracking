// ─── Departments Page ─────────────────────────────────────────────────────────
// For HR and admins only.
// Shows all departments with employee counts.
// Clicking a department expands it to show the employees inside.

import { useState, useEffect } from 'react'
import { getDepartments, getDepartmentEmployees } from '../api/reports'
import type { Department } from '../types'
import { Users, ChevronDown, ChevronRight } from 'lucide-react'

// Shape of each employee returned by the department detail API
interface Employee {
  id: number
  name: string
  email: string
  role: string
  salary: number
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading]     = useState(true)

  // Tracks which department is currently expanded (only one at a time)
  const [expandedDept, setExpandedDept] = useState<string | null>(null)

  // Cache of employees per department — avoids re-fetching on every expand
  const [employeeCache, setEmployeeCache] = useState<Record<string, Employee[]>>({})

  // Load the list of departments when the page first opens
  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data.departments))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Expand or collapse a department row
  async function toggleDepartment(deptName: string) {
    // If already open, close it
    if (expandedDept === deptName) {
      setExpandedDept(null)
      return
    }

    setExpandedDept(deptName)

    // Only fetch employees if they are not already cached
    if (!employeeCache[deptName]) {
      try {
        const res = await getDepartmentEmployees(deptName)
        setEmployeeCache((prev) => ({ ...prev, [deptName]: res.data.employees }))
      } catch {
        setEmployeeCache((prev) => ({ ...prev, [deptName]: [] }))
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <p className="text-gray-500 text-sm mt-1">Employee breakdown by department</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-500" />
          All Departments
        </h2>

        {isLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : departments.length === 0 ? (
          <p className="text-sm text-gray-400">No departments found.</p>
        ) : (
          <div className="space-y-2">
            {departments.map((dept) => {
              const isOpen = expandedDept === dept.department
              const deptEmployees = employeeCache[dept.department]

              return (
                <div key={dept.department} className="border border-gray-100 rounded-lg overflow-hidden">

                  {/* Clickable department row */}
                  <button
                    onClick={() => toggleDepartment(dept.department)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isOpen
                        ? <ChevronDown  size={16} className="text-blue-500" />
                        : <ChevronRight size={16} className="text-gray-400" />
                      }
                      <span className="font-medium text-gray-800">{dept.department}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {dept.total_employees} employees
                    </span>
                  </button>

                  {/* Employee table — only shown when this department is expanded */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      {!deptEmployees ? (
                        <p className="text-xs text-gray-400">Loading...</p>
                      ) : deptEmployees.length === 0 ? (
                        <p className="text-xs text-gray-400">No employees found.</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="pb-2 font-medium">Name</th>
                              <th className="pb-2 font-medium">Email</th>
                              <th className="pb-2 font-medium">Role</th>
                              <th className="pb-2 font-medium">Salary</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deptEmployees.map((employee) => (
                              <tr key={employee.id} className="border-t border-gray-100">
                                <td className="py-1.5 font-medium">{employee.name}</td>
                                <td className="py-1.5 text-gray-500">{employee.email}</td>
                                <td className="py-1.5 capitalize">{employee.role}</td>
                                <td className="py-1.5">₹{employee.salary?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
