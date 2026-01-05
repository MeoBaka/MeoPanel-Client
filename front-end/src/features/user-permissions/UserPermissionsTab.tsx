'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { usePM2Data } from '@/contexts/PM2DataContext'
import { UserPermissionsTabProps, PM2Process, WServer } from './types'
import { useUserPermissions } from './hooks/useUserPermissions'
import UserPermissionsMyPermissions from './components/UserPermissionsMyPermissions'
import UserPermissionsEditor from './components/UserPermissionsEditor'
import UserPermissionsTable from './components/UserPermissionsTable'
import UserPermissionsToast from './components/UserPermissionsToast'

export default function UserPermissionsTab({ activeTab }: UserPermissionsTabProps) {
  const { user } = useAuth()
  const { connectToServer, sendToServer, isConnected } = useWebSocket()
  const [pm2Processes, setPm2Processes] = useState<PM2Process[]>([])
  const [fetchingProcesses, setFetchingProcesses] = useState(false)
  const lastFetchedServer = useRef<string | null>(null)
  const lastFetchTime = useRef<number>(0)

  const {
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
  } = useUserPermissions(user)

  // Handle WebSocket messages for PM2 processes
  const handleMessage = useCallback((event: MessageEvent, serverId: string) => {
    try {
      const message = JSON.parse(event.data)
      if (message.type === 'pm2-getlist' && serverId === selectedServer) {
        setPm2Processes(message.data || [])
        setFetchingProcesses(false)
        // Update cache info for this server
        lastFetchedServer.current = selectedServer
        lastFetchTime.current = Date.now()
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      setFetchingProcesses(false)
    }
  }, [selectedServer])

  // Fetch PM2 processes when server changes
  useEffect(() => {
    if (selectedServer) {
      // Check if we already have data for this server and it was fetched recently (within 30 seconds)
      const now = Date.now()
      if (lastFetchedServer.current === selectedServer && (now - lastFetchTime.current) < 30000 && pm2Processes.length > 0) {
        // Already have recent data for this server, no need to fetch again
        setFetchingProcesses(false)
        return
      }

      setFetchingProcesses(true)
      const wserver = wservers.find(s => s.id === selectedServer)
      if (wserver) {
        // Establish WebSocket connection first, then send pm2-getlist
        connectToServer(wserver, handleMessage, (ws, server) => {
          // Send pm2-getlist command after connection is established (single request)
          const token = selectedServer === 'local' ? localStorage.getItem('accessToken') : server.token
          sendToServer(selectedServer, {
            uuid: server.uuid,
            token: token,
            command: 'pm2-getlist',
            timestamp: Date.now()
          })
        })
      }
    } else {
      setPm2Processes([])
      setFetchingProcesses(false)
    }
  }, [selectedServer, connectToServer, sendToServer, wservers, handleMessage, pm2Processes.length])


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
        <UserPermissionsMyPermissions
          myPermissions={myPermissions}
          permissionOptions={permissionOptions}
        />
      )}

      {/* Permission Editor - Only for admins */}
      {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
        <UserPermissionsEditor
          users={users}
          wservers={wservers}
          pm2Processes={pm2Processes}
          permissionOptions={permissionOptions}
          selectedUser={selectedUser}
          selectedServer={selectedServer}
          selectedProcesses={selectedProcesses}
          currentPermissions={currentPermissions}
          saving={saving}
          fetchingProcesses={fetchingProcesses}
          onUserChange={setSelectedUser}
          onServerChange={setSelectedServer}
          onProcessToggle={(processName) => {
            setSelectedProcesses(prev =>
              prev.includes(processName)
                ? prev.filter(name => name !== processName)
                : [...prev, processName]
            )
          }}
          onSelectAllProcesses={() => selectAllProcesses(pm2Processes)}
          onPermissionToggle={togglePermission}
          onSelectAllPermissions={selectAllPermissions}
          onSave={handleSavePermissions}
        />
      )}

      {/* Permissions List - Only for admins */}
      {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
        <UserPermissionsTable
          permissions={permissions}
          permissionOptions={permissionOptions}
          onDeletePermission={handleDeletePermission}
        />
      )}

      {/* Toast Notification */}
      <UserPermissionsToast toast={toast} />
    </div>
  )
}