// ─── Shared Constants ────────────────────────────────────────────────────────

// Month names indexed 0–11 (use month - 1 to get the label)
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Short month names for charts
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ─── Shared Helper Functions ────────────────────────────────────────────────
// These small utilities are used across multiple pages to keep code DRY.

/**
 * Extracts a readable error message from an Axios API error.
 * FastAPI returns errors in the shape: { detail: "..." }
 * If no detail is found, falls back to the provided default message.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  const err = error as { response?: { data?: { detail?: string } } }
  return err.response?.data?.detail ?? fallback
}

/**
 * Returns the Tailwind CSS classes for a leave status badge.
 * pending  → yellow
 * approved → green
 * rejected → red
 */
export function getStatusBadgeClass(status: string): string {
  const colorMap: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100  text-green-700',
    rejected: 'bg-red-100    text-red-700',
  }
  const color = colorMap[status] ?? 'bg-gray-100 text-gray-700'
  return `${color} px-2 py-0.5 rounded-full text-xs font-medium capitalize`
}

/**
 * Triggers a file download in the browser from a Blob response.
 * Used for CSV export.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
