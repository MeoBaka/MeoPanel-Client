import { AuditLog } from '../types'

interface AdminLogTableProps {
  logs: AuditLog[]
  onRowDoubleClick: (log: AuditLog) => void
}

export default function AdminLogTable({ logs, onRowDoubleClick }: AdminLogTableProps) {
  return (
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
              onDoubleClick={() => onRowDoubleClick(log)}
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
  )
}