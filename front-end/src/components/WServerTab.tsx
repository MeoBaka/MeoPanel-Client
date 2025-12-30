'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface WServer {
  id: string // This is the server_uuid for display
  servername: string
  url: string
  uuid: string // This is for WebSocket authentication only
  token: string
  createdAt: string
  updatedAt: string
}

interface ServerStatus {
  connection_address: string
  memory: {
    total: number
    used: number
    free: number
  }
  cpu: {
    cores: number
    usage: number
  }
  disk_space: {
    used: number
    max: number
    allow: number
  }
  total_instances: number
  running_instances: number
  stopped_instances: number
  total_pm2: number
  running_pm2: number
  stopped_pm2: number
  platform: string
  version: {
    node: string
    server: string
  }
}

type ConnectionStatus = 'connecting' | 'online' | 'offline'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface WServerTabProps {
  activeTab: string
  user: User | null
}

export default function WServerTab({ activeTab, user }: WServerTabProps) {
   const { connectToServer, sendToServer, isConnected } = useWebSocket()
   const [wservers, setWservers] = useState<WServer[]>([])
   const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({})
   const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({})
   const [showAddModal, setShowAddModal] = useState(false)
   const [formData, setFormData] = useState({
     servername: '',
     url: '',
     uuid: '',
     token: ''
   })
   const [loading, setLoading] = useState(false)
   const updateIntervals = useRef<Record<string, NodeJS.Timeout>>({})
   const pingIntervals = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    fetchWservers()
  }, [])

  const handleMessage = useCallback((event: MessageEvent, serverId: string) => {
    try {
      const message = event.data

      // Try to parse as JSON first
      const parsedMessage = JSON.parse(message)

      // Check if it's a ping response
      if (parsedMessage.pong && parsedMessage.status === 'ok') {
        // Handle ping response - connection is healthy
        setConnectionStatuses(prev => ({
          ...prev,
          [serverId]: 'online'
        }))
        return
      }

      // Check if it's an error response
      if (parsedMessage.type === 'error') {
        console.error('Server error:', parsedMessage.message)
        setConnectionStatuses(prev => ({
          ...prev,
          [serverId]: 'offline'
        }))
        return
      }

      // Check if it's a status update
      if (parsedMessage.type === 'status' && parsedMessage.data) {
        const data: ServerStatus = parsedMessage.data
        setServerStatuses(prev => ({
          ...prev,
          [serverId]: data
        }))
        setConnectionStatuses(prev => ({
          ...prev,
          [serverId]: 'online'
        }))
        return
      }
    } catch (error) {
      console.error('Failed to parse server message:', error)
      setConnectionStatuses(prev => ({
        ...prev,
        [serverId]: 'offline'
      }))
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'wserver') return;

    // Connect to WebSocket for each wserver with onOpen callback
    wservers.forEach(wserver => {
      connectToServer(wserver, handleMessage, (ws, connectedWserver) => {
        // Send status command only when connection is fully established (exact PM2 pattern)
        sendToServer(connectedWserver.id, { command: 'status', uuid: connectedWserver.uuid, token: connectedWserver.token })
      })
    })

    return () => {
      // Cleanup intervals
      Object.values(updateIntervals.current).forEach(clearInterval)
      Object.values(pingIntervals.current).forEach(clearInterval)
      updateIntervals.current = {}
      pingIntervals.current = {}

      // Send status-stop to all wservers
      wservers.forEach(wserver => {
        if (isConnected(wserver.id)) {
          sendToServer(wserver.id, { command: 'status-stop' })
        }
      })
    }
  }, [wservers, activeTab, connectToServer, handleMessage, sendToServer])

  useEffect(() => {
    // Start or stop ping intervals based on activeTab
    wservers.forEach(wserver => {
      if (isConnected(wserver.id)) {
        if (activeTab === 'wserver') {
          // Start ping interval if not already running
          if (!pingIntervals.current[wserver.id]) {
            pingIntervals.current[wserver.id] = setInterval(() => {
              if (isConnected(wserver.id)) {
                sendToServer(wserver.id, 'ping')
              }
            }, 30000)
          }
        } else {
          // Stop intervals when not active
          if (pingIntervals.current[wserver.id]) {
            clearInterval(pingIntervals.current[wserver.id])
            delete pingIntervals.current[wserver.id]
          }
        }
      }
    })
  }, [activeTab, wservers, isConnected, sendToServer])

  const fetchWservers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/wservers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWservers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch wservers:', error)
    }
  }

  const handleAddWserver = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/wservers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setShowAddModal(false)
        setFormData({ servername: '', url: '', uuid: '', token: '' })
        fetchWservers()
      } else {
        console.error('Failed to add wserver')
      }
    } catch (error) {
      console.error('Error adding wserver:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/wservers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchWservers()
      } else {
        console.error('Failed to delete wserver')
      }
    } catch (error) {
      console.error('Error deleting wserver:', error)
    }
  }


  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">WServer Management</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add WServer
        </button>
      </div>

      <div className="grid gap-6">
        {wservers.map((wserver) => {
          const status = serverStatuses[wserver.id]
          const connectionStatus = connectionStatuses[wserver.id] || 'connecting'
          const isOffline = connectionStatus === 'offline'

          return (
            <div key={wserver.id} className="bg-gray-800 p-6 rounded-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-medium text-lg">{wserver.servername}</h4>
                  <p className="text-gray-400 text-sm">Server UUID: {wserver.id}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => console.log('Edit', wserver.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wserver.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm ${isOffline ? 'opacity-50' : ''}`}>
                <div>
                  <span className="text-gray-400">Connection Address:</span>
                  <p className="text-white">{status?.connection_address || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Server Status:</span>
                  <p className={`font-medium ${
                    connectionStatus === 'online' ? 'text-green-400' :
                    connectionStatus === 'connecting' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {connectionStatus === 'connecting' ? 'Connecting...' :
                     connectionStatus === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
                {status && status.memory && (
                  <>
                    <div>
                      <span className="text-gray-400">Memory:</span>
                      <p className="text-white">
                        Used: {formatBytes(status.memory.used)} / Total: {formatBytes(status.memory.total)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">CPU:</span>
                      <p className="text-white">{status.cpu.cores} cores, {status.cpu.usage}% usage</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Disk Space:</span>
                      <p className="text-white">
                        Used: {formatBytes(status.disk_space.used)} / Max: {formatBytes(status.disk_space.max)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Instances Status:</span>
                      <p className="text-white">
                        Total: {status.total_instances}, Running: {status.running_instances}, Stopped: {status.stopped_instances}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">PM2 Status:</span>
                      <p className="text-white">
                        Total: {status.total_pm2}, Running: {status.running_pm2}, Stopped: {status.stopped_pm2}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Platform:</span>
                      <p className="text-white">{status.platform}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Version:</span>
                      <p className="text-white">Node: {status.version.node}, Server: {status.version.server}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
        {wservers.length === 0 && (
          <p className="text-gray-400 text-center py-8">No wservers found. Click "Add WServer" to add your first server.</p>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-md w-full max-w-md">
            <h4 className="text-white text-lg font-medium mb-4">Add New WServer</h4>
            <form onSubmit={handleAddWserver}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Server Name</label>
                <input
                  type="text"
                  value={formData.servername}
                  onChange={(e) => setFormData({ ...formData, servername: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">UUID</label>
                <input
                  type="text"
                  value={formData.uuid}
                  onChange={(e) => setFormData({ ...formData, uuid: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Token</label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add WServer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}