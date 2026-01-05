import { PM2Permission, PermissionOption } from '../types'

interface UserPermissionsTableProps {
  permissions: PM2Permission[]
  permissionOptions: PermissionOption[]
  onDeletePermission: (permissionId: string) => void
}

/**
 * Renders a table of user permissions with mapped labels and a delete action.
 *
 * @param permissions - List of permissions to display; each row shows user, server, process, and permission values.
 * @param permissionOptions - Mapping of permission `value` to human-readable `label` used for each permission chip; falls back to the raw value when missing.
 * @param onDeletePermission - Callback invoked with the permission `id` when the row's Delete button is clicked.
 * @returns A JSX element rendering the permissions table.
 */
export default function UserPermissionsTable({
  permissions,
  permissionOptions,
  onDeletePermission
}: UserPermissionsTableProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Server</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Process</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Permissions</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td className="px-6 py-4 whitespace-nowrap text-white">
                {permission.user?.username || permission.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-white">
                {permission.wserver?.servername || permission.wserverId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-white">
                {permission.pm2ProcessName}
              </td>
              <td className="px-6 py-4 text-white">
                <div className="flex flex-wrap gap-1">
                  {permission.permissions.map(p => (
                    <span key={p} className="px-2 py-1 bg-blue-600 text-xs rounded">
                      {permissionOptions.find(opt => opt.value === p)?.label || p}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onDeletePermission(permission.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {permissions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                No permissions configured
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}