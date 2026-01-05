import { PM2Permission, PermissionOption } from '../types'

interface UserPermissionsMyPermissionsProps {
  myPermissions: PM2Permission[]
  permissionOptions: PermissionOption[]
}

export default function UserPermissionsMyPermissions({
  myPermissions,
  permissionOptions
}: UserPermissionsMyPermissionsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-medium text-white mb-4">My PM2 Permissions</h4>
      {myPermissions.length === 0 ? (
        <p className="text-gray-400">You don't have any PM2 permissions assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {myPermissions.map((permission) => (
            <div key={permission.id} className="bg-gray-700 rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="text-white font-medium">{permission.pm2ProcessName}</h5>
                  <p className="text-gray-400 text-sm">
                    Server: {permission.wserver?.servername || permission.wserverId}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {permission.permissions.map(perm => (
                  <span key={perm} className="px-2 py-1 bg-blue-600 text-xs rounded">
                    {permissionOptions.find(opt => opt.value === perm)?.label || perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}