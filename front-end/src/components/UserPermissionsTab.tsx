'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
}

interface WServer {
  id: string
  servername: string
  url: string
  uuid: string
  token: string
  createdAt: string
  updatedAt: string
}

interface PM2Permission {
  id: string
  userId: string
  wserverId: string
  pm2ProcessName: string
  permissions: string[]
  user?: User
  wserver?: WServer
}

interface UserPermissionsTabProps {
  activeTab: string
}

export default function UserPermissionsTab({ activeTab }: UserPermissionsTabProps) {
  const { user } = useAuth()
  const { connectToServer, sendToServer, isConnected } = useWebSocket()
  const [users, setUsers] = useState<User[]>([])
  const [wservers, setWservers] = useState<WServer[]>([])
  const [permissions, setPermissions] = useState<PM2Permission[]>([])
  const [myPermissions, setMyPermissions] = useState<PM2Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [pm2Processes, setPm2Processes] = useState<{name: string, pm_id: number}[]>([])
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [fetchingProcesses, setFetchingProcesses] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const permissionOptions = [
    { value: 'view', label: 'View PM2 Process' },
    { value: 'control', label: 'Control (Start/Stop/Restart/Send)' },
    { value: 'edit_note', label: 'Edit Notes' },
    { value: 'control_file', label: 'Control Files' },
    { value: 'save_resurrect', label: 'Save/Resurrect' }
  ]

  useEffect(() => {
    fetchUsers()
    fetchWservers()
    fetchPermissions()
    fetchMyPermissions()
  }, [])

  useEffect(() => {
    if (selectedServer) {
      setPm2Processes([])
      setSelectedProcesses([])
      fetchPM2Processes()
    } else {
      setPm2Processes([])
      setSelectedProcesses([])
    }
  }, [selectedServer])

  useEffect(() => {
    if (selectedUser && selectedServer && selectedProcesses.length > 0) {
      fetchCurrentPermissions()
    } else {
      setCurrentPermissions([])
    }
  }, [selectedUser, selectedServer, selectedProcesses])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchWservers = async () => {
    // Always include local server for permissions management
    const localServer = {
      id: 'local',
      servername: 'Local Server',
      url: 'ws://localhost:5000',
      uuid: 'local-server',
      token: 'local-token',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/wservers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const responseData = await response.json()
        const remoteServers = responseData.data || []
        setWservers([localServer, ...remoteServers])
      } else {
        // If not authorized or other error, still provide local server
        setWservers([localServer])
      }
    } catch (error) {
      console.error('Failed to fetch wservers:', error)
      // If fetching fails, still provide local server
      setWservers([localServer])
    }
  }

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/pm2-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPermissions = async () => {
    if (!user) return
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/pm2-permissions/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMyPermissions(data)
      }
    } catch (error) {
      console.error('Failed to fetch my permissions:', error)
    }
  }

  const fetchPM2Processes = async () => {
    if (!selectedServer) return

    setFetchingProcesses(true)
    // For permissions management, we'll use a simple hardcoded list for now
    // In a real implementation, this would connect to the server to get actual processes
    setTimeout(() => {
      setPm2Processes([
        { name: 'app1', pm_id: 0 },
        { name: 'app2', pm_id: 1 },
        { name: 'worker1', pm_id: 2 },
        { name: 'worker2', pm_id: 3 }
      ])
      setFetchingProcesses(false)
    }, 1000)
  }

  const fetchCurrentPermissions = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/pm2-permissions/user/${selectedUser}/server/${selectedServer}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // For multiple processes, show permissions that are common to all selected processes
        const relevantPermissions = data.filter((p: PM2Permission) =>
          selectedProcesses.includes(p.pm2ProcessName)
        )
        if (relevantPermissions.length === 0) {
          setCurrentPermissions([])
        } else if (relevantPermissions.length === 1) {
          setCurrentPermissions(relevantPermissions[0].permissions)
        } else {
          // Find common permissions across all selected processes
          const commonPermissions = relevantPermissions[0].permissions.filter((perm: string) =>
            relevantPermissions.every((rp: PM2Permission) => rp.permissions.includes(perm))
          )
          setCurrentPermissions(commonPermissions)
        }
      }
    } catch (error) {
      console.error('Failed to fetch current permissions:', error)
      setCurrentPermissions([])
    }
  }

  const savePermissions = async () => {
    if (!selectedUser || !selectedServer || selectedProcesses.length === 0) return

    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      console.log('Saving permissions for user:', selectedUser, 'processes:', selectedProcesses, 'permissions:', currentPermissions)
      const promises = selectedProcesses.map(processName =>
        fetch('http://localhost:5000/pm2-permissions/upsert', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: selectedUser,
            wserverId: selectedServer,
            pm2ProcessName: processName,
            permissions: currentPermissions
          })
        })
      )

      const results = await Promise.all(promises)
      console.log('Save results:', results.map(r => r.status))
      const allSuccessful = results.every(r => r.ok)

      if (allSuccessful) {
        await fetchPermissions()
        setToast({ message: `Permissions saved for ${selectedProcesses.length} process(es)`, type: 'success' })
      } else {
        setToast({ message: 'Failed to save some permissions', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to save permissions:', error)
      setToast({ message: 'Failed to save permissions', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const deletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/pm2-permissions/${permissionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchPermissions()
      } else {
        alert('Failed to delete permission')
      }
    } catch (error) {
      console.error('Failed to delete permission:', error)
      alert('Failed to delete permission')
    }
  }

  const togglePermission = (permission: string) => {
    setCurrentPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
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
      <h3 className="text-2xl font-bold text-white">User PM2 Permissions</h3>

      {/* My Permissions Section */}
      {user && (user.role === 'MEMBER') && (
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
      )}

      {/* Permission Editor - Only for admins */}
      {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Set Permissions</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
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
              onChange={(e) => setSelectedServer(e.target.value)}
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
                  onClick={() => {
                    if (selectedProcesses.length === pm2Processes.length) {
                      setSelectedProcesses([])
                    } else {
                      setSelectedProcesses(pm2Processes.map(p => p.name))
                    }
                  }}
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProcesses(prev => [...prev, p.name])
                        } else {
                          setSelectedProcesses(prev => prev.filter(name => name !== p.name))
                        }
                      }}
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
                onClick={() => {
                  if (currentPermissions.length === permissionOptions.length) {
                    setCurrentPermissions([])
                  } else {
                    setCurrentPermissions(permissionOptions.map(opt => opt.value))
                  }
                }}
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
                    onChange={() => togglePermission(option.value)}
                    className="mr-2"
                  />
                  <span className="text-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={savePermissions}
          disabled={saving || !selectedUser || !selectedServer || selectedProcesses.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>
      )}

      {/* Permissions List - Only for admins */}
      {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
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
                    onClick={() => deletePermission(permission.id)}
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
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-2 rounded shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}