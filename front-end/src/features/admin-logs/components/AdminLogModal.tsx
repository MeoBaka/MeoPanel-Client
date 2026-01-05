import { AuditLog } from '../types'

interface AdminLogModalProps {
  selectedLog: AuditLog | null
  isOpen: boolean
  onClose: () => void
}

export default function AdminLogModal({ selectedLog, isOpen, onClose }: AdminLogModalProps) {
  if (!isOpen || !selectedLog) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Audit Log Details</h3>
          <button
            onClick={onClose}
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}