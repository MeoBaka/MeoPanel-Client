'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface WServer {
  id: string
  servername: string
  url: string
  uuid: string
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
  platform: string
  version: {
    node: string
    server: string
  }
}

export default function WServerTab() {
  const { user } = useAuth()
  const [wservers, setWservers] = useState<WServer[]>([])
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    servername: '',
    url: '',
    uuid: '',
    token: ''
  })
  const [loading, setLoading] = useState(false)
  const wsRefs = useRef<Record<string, WebSocket>>({})

  useEffect(() => {
    fetchWservers()
  }, [])

  useEffect(() => {
    // Connect to WebSocket for each wserver
    wservers.forEach(wserver => {
      connectToServer(wserver)
    })

    return () => {
      // Cleanup WebSocket connections
      Object.values(wsRefs.current).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      })
      wsRefs.current = {}
    }
  }, [wservers])

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

  const connectToServer = (wserver: WServer) => {
    if (wsRefs.current[wserver.id]) {
      wsRefs.current[wserver.id].close()
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = wserver.url.replace(/^http/, 'ws')

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      // Send authentication message
      const authMessage = {
        uuid: wserver.uuid,
        token: wserver.token
      }
      ws.send(JSON.stringify(authMessage))
    }

    ws.onmessage = (event) => {
      try {
        const data: ServerStatus = JSON.parse(event.data)
        setServerStatuses(prev => ({
          ...prev,
          [wserver.id]: data
        }))
      } catch (error) {
        console.error('Failed to parse server status:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error for server', wserver.servername, error)
    }

    ws.onclose = () => {
      // Optionally reconnect after some time
      setTimeout(() => connectToServer(wserver), 5000)
    }

    wsRefs.current[wserver.id] = ws
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
          return (
            <div key={wserver.id} className="bg-gray-800 p-6 rounded-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-medium text-lg">{wserver.servername}</h4>
                  <p className="text-gray-400 text-sm">UUID: server-uuid</p>
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

              {status ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Connection Address:</span>
                    <p className="text-white">{status.connection_address}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Server Status:</span>
                    <p className="text-green-400">Online</p>
                  </div>
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
                    <p className="text-white">N/A</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Platform:</span>
                    <p className="text-white">{status.platform}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Version:</span>
                    <p className="text-white">Node: {status.version.node}, Server: {status.version.server}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">Connecting to server...</p>
                </div>
              )}
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