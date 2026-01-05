interface AdminLogPaginationProps {
  currentPage: number
  totalPages: number
  total: number
  logsCount: number
  onPageChange: (page: number) => void
}

/**
 * Render pagination controls and an entry range summary for the admin logs view.
 *
 * @param currentPage - The current 1-based page number
 * @param totalPages - The total number of pages available
 * @param total - The total number of log entries across all pages
 * @param logsCount - The number of log entries on the current page (used to compute the shown start)
 * @param onPageChange - Callback invoked with the target page number when the user navigates
 * @returns A JSX element displaying "Showing X to Y of Z entries" and Previous / Next controls
 */
export default function AdminLogPagination({
  currentPage,
  totalPages,
  total,
  logsCount,
  onPageChange,
}: AdminLogPaginationProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-gray-300">
        Showing {logsCount > 0 ? ((currentPage - 1) * 20) + 1 : 0} to {Math.min(currentPage * 20, total)} of {total} entries
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
        >
          Previous
        </button>
        <span className="text-white">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  )
}