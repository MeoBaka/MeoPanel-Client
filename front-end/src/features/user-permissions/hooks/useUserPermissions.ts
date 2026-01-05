import { useState, useEffect } from 'react'
import { User, WServer, PM2Permission, PM2Process, Toast, PermissionOption } from '../types'
import {
  fetchUsers,
  fetchWservers,
  fetchPermissions,
  fetchMyPermissions,
  fetchCurrentPermissions,
  savePermissions,
  deletePermission
} from '../services/userPermissionsService'

const permissionOptions: PermissionOption[] = [
  { value: 'view', label: 'View PM2 Process' },
  { value: 'control', label: 'Control (Start/Stop/Restart/Send)' },
  { value: 'edit_note', label: 'Edit Notes' },
  { value: 'control_file', label: 'Control Files' },
  { value: 'save_resurrect', label: 'Save/Resurrect' }
]

export const useUserPermissions = (currentUser: User | null) => {
  const [users, setUsers] = useState<User[]>([])
  const [wservers, setWservers] = useState<WServer[]>([])
  const [permissions, setPermissions] = useState<PM2Permission[]>([])
  const [myPermissions, setMyPermissions] = useState<PM2Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersData, wserversData, permissionsData] = await Promise.all([
          fetchUsers(),
          fetchWservers(),
          fetchPermissions()
        ])
        setUsers(usersData)
        // Filter out local server, only show remote servers
        setWservers(wserversData.filter(server => server.servername !== 'Local Server'))
        setPermissions(permissionsData)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Load user's own permissions
  useEffect(() => {
    if (currentUser) {
      fetchMyPermissions(currentUser.id)
        .then(setMyPermissions)
        .catch(error => console.error('Failed to fetch my permissions:', error))
    }
  }, [currentUser])


  // Load current permissions when user, server, or processes change
  useEffect(() => {
    if (selectedUser && selectedServer && selectedProcesses.length > 0) {
      fetchCurrentPermissions(selectedUser, selectedServer)
        .then(data => {
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
        })
        .catch(error => {
          console.error('Failed to fetch current permissions:', error)
          setCurrentPermissions([])
        })
    } else {
      setCurrentPermissions([])
    }
  }, [selectedUser, selectedServer, selectedProcesses])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleSavePermissions = async () => {
    if (!selectedUser || !selectedServer || selectedProcesses.length === 0) return

    setSaving(true)
    try {
      const promises = selectedProcesses.map(processName =>
        savePermissions(selectedUser, selectedServer, processName, currentPermissions)
      )

      await Promise.all(promises)

      // Refresh permissions list
      const updatedPermissions = await fetchPermissions()
      setPermissions(updatedPermissions)

      setToast({
        message: `Permissions saved for ${selectedProcesses.length} process(es)`,
        type: 'success'
      })
    } catch (error) {
      console.error('Failed to save permissions:', error)
      setToast({ message: 'Failed to save permissions', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return

    try {
      await deletePermission(permissionId)
      const updatedPermissions = await fetchPermissions()
      setPermissions(updatedPermissions)
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

  const selectAllProcesses = (allProcesses: PM2Process[]) => {
    if (selectedProcesses.length === allProcesses.length) {
      setSelectedProcesses([])
    } else {
      setSelectedProcesses(allProcesses.map(p => p.name))
    }
  }

  const selectAllPermissions = () => {
    if (currentPermissions.length === permissionOptions.length) {
      setCurrentPermissions([])
    } else {
      setCurrentPermissions(permissionOptions.map(opt => opt.value))
    }
  }

  return {
    // Data
    users,
    wservers,
    permissions,
    myPermissions,
    permissionOptions,

    // State
    loading,
    selectedUser,
    selectedServer,
    selectedProcesses,
    currentPermissions,
    saving,
    toast,

    // Actions
    setSelectedUser,
    setSelectedServer,
    setSelectedProcesses,
    togglePermission,
    handleSavePermissions,
    handleDeletePermission,
    selectAllProcesses,
    selectAllPermissions,
  }
}