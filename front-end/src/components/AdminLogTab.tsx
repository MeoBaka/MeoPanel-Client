'use client'

import { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  userId: string | null
  user?: {
    id: string
    name: string
    username: string
    email: string
  }
  action: string
  resource: string
  details: string
  ipAddress: string | null
  userAgent: string | null
  sessionId: string | null
  metadata: any
  isSuccess: number
  createdAt: string
}

interface AdminLogTabProps {
  activeTab: string
}

export default function AdminLogTab({ activeTab }: AdminLogTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    username: '',
    resource: '',
    startDate: '',
    endDate: '',
  })
  const [tempFilters, setTempFilters] = useState({
    username: '',
    resource: '',
    startDate: '',
    endDate: '',
  })

  const pageSize = 20

  useEffect(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const defaultStartDate = sevenDaysAgo.toISOString().split('T')[0]
    const defaultEndDate = now.toISOString().split('T')[0]

    setFilters(prev => ({
      ...prev,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    }))

    setTempFilters(prev => ({
      ...prev,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    }))
  }, [])

  useEffect(() => {
    fetchAuditLogs()
  }, [currentPage, filters])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString(),
      })

      if (filters.username) params.append('username', filters.username)
      if (filters.resource) params.append('resource', filters.resource)
      if (filters.startDate) params.append('startDate', filters.startDate + 'T00:00:00.000Z')
      if (filters.endDate) params.append('endDate', filters.endDate + 'T23:59:59.999Z')

      const response = await fetch(`http://localhost:5000/audit/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowDoubleClick = (log: AuditLog) => {
    setSelectedLog(log)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLog(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Admin Log</h3>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={tempFilters.username}
              onChange={(e) => setTempFilters(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Resource</label>
            <select
              value={tempFilters.resource}
              onChange={(e) => setTempFilters(prev => ({ ...prev, resource: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              <option value="USER">User</option>
              <option value="AUTH">Auth</option>
              <option value="SESSION">Session</option>
              <option value="PASSWORD">Password</option>
              <option value="EMAIL">Email</option>
              <option value="TWO_FA">Two FA</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={tempFilters.startDate}
              onChange={(e) => setTempFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={tempFilters.endDate}
              onChange={(e) => setTempFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters(tempFilters);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">IP</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Success</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {logs.map((log) => (
              <tr
                key={log.id}
                onDoubleClick={() => handleRowDoubleClick(log)}
                className="cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {log.user ? log.user.username : 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {log.resource}
                </td>
                <td className="px-6 py-4 text-white max-w-xs truncate">
                  {log.details}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {log.ipAddress || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.isSuccess ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                  }`}>
                    {log.isSuccess ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-gray-300">
          Showing {logs.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, total)} of {total} entries
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Previous
          </button>
          <span className="text-white">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for detailed log view */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Audit Log Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Log ID</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md">{selectedLog.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Created At</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md">
                    {selectedLog.user ? (
                      <div>
                        <div><strong>Username:</strong> {selectedLog.user.username}</div>
                        <div><strong>Name:</strong> {selectedLog.user.name}</div>
                        <div><strong>Email:</strong> {selectedLog.user.email}</div>
                      </div>
                    ) : (
                      'System'
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Action & Resource</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md">
                    <div><strong>Action:</strong> {selectedLog.action}</div>
                    <div><strong>Resource:</strong> {selectedLog.resource}</div>
                    <div><strong>Success:</strong> {selectedLog.isSuccess ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Details</label>
                <div className="text-white bg-gray-700 px-3 py-2 rounded-md whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">IP Address</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md">
                    {selectedLog.ipAddress || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User Agent</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md text-sm">
                    {selectedLog.userAgent || 'N/A'}
                  </div>
                </div>
              </div>

              {selectedLog.sessionId && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Session ID</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md font-mono text-sm">
                    {selectedLog.sessionId}
                  </div>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Metadata</label>
                  <div className="text-white bg-gray-700 px-3 py-2 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}