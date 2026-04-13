// ─── Export Reports Page ──────────────────────────────────────────────────────
// For HR and admins only.
// Lets them download CSV reports for attendance ranking, monthly summary, or leaves.

import { useState } from 'react'
import { exportMasterReport } from '../api/reports'
import { getErrorMessage, downloadBlob } from '../utils/helpers'
import { FileDown, Download } from 'lucide-react'

// All months for the period selector
const MONTHS = [
  { value: 1,  label: 'January'   },
  { value: 2,  label: 'February'  },
  { value: 3,  label: 'March'     },
  { value: 4,  label: 'April'     },
  { value: 5,  label: 'May'       },
  { value: 6,  label: 'June'      },
  { value: 7,  label: 'July'      },
  { value: 8,  label: 'August'    },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October'   },
  { value: 11, label: 'November'  },
  { value: 12, label: 'December'  },
]

// Generate the last 5 years for the year dropdown
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

// The three report types supported by the backend
type ReportType = 'ranking' | 'summary' | 'leaves'

// Report options shown as selectable cards
const REPORT_OPTIONS = [
  {
    type: 'ranking' as ReportType,
    title: 'Attendance Ranking',
    description: 'Overall attendance leaderboard',
    icon: '🏆',
  },
  {
    type: 'summary' as ReportType,
    title: 'Monthly Summary',
    description: 'Attendance summary for a specific month',
    icon: '📊',
  },
  {
    type: 'leaves' as ReportType,
    title: 'Leaves Report',
    description: 'All leave records for a specific month',
    icon: '📅',
  },
]

export default function ExportReports() {
  const [reportType, setReportType] = useState<ReportType>('ranking')
  const [month, setMonth]           = useState(new Date().getMonth() + 1)
  const [year, setYear]             = useState(CURRENT_YEAR)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Ranking report doesn't need a month/year — only summary and leaves do
  const needsPeriod = reportType !== 'ranking'

  async function handleExport() {
    setError('')
    setLoading(true)

    try {
      const response = await exportMasterReport(
        reportType,
        needsPeriod ? month : undefined,
        needsPeriod ? year  : undefined
      )

      // Get the filename from the response header, or build a fallback
      const contentDisposition = response.headers['content-disposition'] ?? ''
      const filename = contentDisposition.split('filename=')[1] ?? `${reportType}_report.csv`

      // Trigger browser file download
      downloadBlob(response.data, filename)

    } catch (err) {
      setError(getErrorMessage(err, 'Export failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileDown size={24} className="text-blue-500" />
          Export Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Download data as CSV files</p>
      </div>

      {/* Report type selector — clicking a card selects that report */}
      <div className="grid grid-cols-1 gap-3">
        {REPORT_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => setReportType(option.type)}
            className={`text-left p-4 rounded-xl border-2 transition-colors ${
              reportType === option.type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{option.title}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Period selector — only shown for reports that need month/year */}
      {needsPeriod && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Select Period</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
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
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors"
      >
        <Download size={18} />
        {loading ? 'Downloading...' : 'Download CSV'}
      </button>

    </div>
  )
}
