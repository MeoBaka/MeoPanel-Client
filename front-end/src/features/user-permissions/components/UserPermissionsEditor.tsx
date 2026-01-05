import { User, WServer, PM2Process, PermissionOption } from '../types'

interface UserPermissionsEditorProps {
  users: User[]
  wservers: WServer[]
  pm2Processes: PM2Process[]
  permissionOptions: PermissionOption[]
  selectedUser: string
  selectedServer: string
  selectedProcesses: string[]
  currentPermissions: string[]
  saving: boolean
  fetchingProcesses: boolean
  onUserChange: (userId: string) => void
  onServerChange: (serverId: string) => void
  onProcessToggle: (processName: string) => void
  onSelectAllProcesses: () => void
  onPermissionToggle: (permission: string) => void
  onSelectAllPermissions: () => void
  onSave: () => void
}

export default function UserPermissionsEditor({
  users,
  wservers,
  pm2Processes,
  permissionOptions,
  selectedUser,
  selectedServer,
  selectedProcesses,
  currentPermissions,
  saving,
  fetchingProcesses,
  onUserChange,
  onServerChange,
  onProcessToggle,
  onSelectAllProcesses,
  onPermissionToggle,
  onSelectAllPermissions,
  onSave,
}: UserPermissionsEditorProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-medium text-white mb-4">Set Permissions</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
          <select
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">Select User</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Server</label>
          <select
            value={selectedServer}
            onChange={(e) => onServerChange(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">Select Server</option>
            {wservers.map(s => (
              <option key={s.id} value={s.id}>{s.servername}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            PM2 Processes
            {pm2Processes.length > 0 && (
              <button
                onClick={onSelectAllProcesses}
                className="ml-2 text-xs text-blue-400 hover:text-blue-300"
              >
                {selectedProcesses.length === pm2Processes.length ? 'Unselect All' : 'Select All'}
              </button>
            )}
          </label>
          <div className="max-h-32 overflow-y-auto bg-gray-700 rounded p-2">
            {fetchingProcesses ? (
              <div className="text-gray-400 text-sm">Loading processes...</div>
            ) : pm2Processes.length === 0 ? (
              <div className="text-gray-400 text-sm">No processes found</div>
            ) : (
              pm2Processes.map(p => (
                <label key={p.name} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={selectedProcesses.includes(p.name)}
                    onChange={() => onProcessToggle(p.name)}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">{p.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedUser && selectedServer && selectedProcesses.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">Permissions</label>
            <button
              onClick={onSelectAllPermissions}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {currentPermissions.length === permissionOptions.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissionOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentPermissions.includes(option.value)}
                  onChange={() => onPermissionToggle(option.value)}
                  className="mr-2"
                />
                <span className="text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={saving || !selectedUser || !selectedServer || selectedProcesses.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Permissions'}
      </button>
    </div>
  )
}