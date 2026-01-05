import { Filters } from '../types'

interface AdminLogFiltersProps {
  filters: Filters
  tempFilters: Filters
  onTempFiltersChange: (filters: Filters) => void
  onApplyFilters: () => void
}

export default function AdminLogFilters({
  filters,
  tempFilters,
  onTempFiltersChange,
  onApplyFilters,
}: AdminLogFiltersProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
          <input
            type="text"
            value={tempFilters.username}
            onChange={(e) => onTempFiltersChange({ ...tempFilters, username: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Resource</label>
          <select
            value={tempFilters.resource}
            onChange={(e) => onTempFiltersChange({ ...tempFilters, resource: e.target.value })}
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
            onChange={(e) => onTempFiltersChange({ ...tempFilters, startDate: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            value={tempFilters.endDate}
            onChange={(e) => onTempFiltersChange({ ...tempFilters, endDate: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onApplyFilters}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Filter
          </button>
        </div>
      </div>
    </div>
  )
}