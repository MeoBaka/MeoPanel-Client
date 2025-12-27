'use client'

import { useState, useEffect, useRef } from 'react'

interface WServer {
  id: string
  servername: string
  url: string
  uuid: string
  token: string
  createdAt: string
  updatedAt: string
}

interface PM2Process {
  name: string
  pid: number
  pm_id: number
  monit: {
    memory: number
    cpu: number
  }
  pm2_env: {
    status: string
    restart_time: number
    pm_uptime: number
  }
}

interface PM2TabProps {
  activeTab: string
}

export default function PM2Tab({ activeTab }: PM2TabProps) {
  const [wservers, setWservers] = useState<WServer[]>([])
  const [pm2Data, setPm2Data] = useState<Record<string, PM2Process[]>>({})
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'connecting' | 'online' | 'offline'>>({})
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, process: PM2Process, serverId: string} | null>(null)

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])
  const wsRefs = useRef<Record<string, WebSocket>>({})
  const updateIntervals = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    fetchWservers()
  }, [])

  useEffect(() => {
    // Connect to WebSocket for each wserver
    wservers.forEach(wserver => {
      connectToServer(wserver)
    })

    return () => {
      // Cleanup WebSocket connections and intervals
      Object.values(wsRefs.current).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      })
      Object.values(updateIntervals.current).forEach(clearInterval)
      wsRefs.current = {}
      updateIntervals.current = {}
    }
  }, [wservers])

  useEffect(() => {
    // Start or stop update intervals based on activeTab
    wservers.forEach(wserver => {
      const ws = wsRefs.current[wserver.id]
      if (ws && ws.readyState === WebSocket.OPEN) {
        if (activeTab === 'pm2') {
          // Start update interval if not already running
          if (!updateIntervals.current[wserver.id]) {
            updateIntervals.current[wserver.id] = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ uuid: wserver.uuid, token: wserver.token, command: 'pm2-list' }))
              } else {
                clearInterval(updateIntervals.current[wserver.id])
                delete updateIntervals.current[wserver.id]
              }
            }, 1000) // Request pm2-list every 1 second
          }
        } else {
          // Stop intervals when not active
          if (updateIntervals.current[wserver.id]) {
            clearInterval(updateIntervals.current[wserver.id])
            delete updateIntervals.current[wserver.id]
          }
        }
      }
    })
  }, [activeTab, wservers])

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

  const connectToServer = (wserver: WServer) => {
    // Don't create a new connection if one is already active
    if (wsRefs.current[wserver.id] && wsRefs.current[wserver.id].readyState === WebSocket.OPEN) {
      return
    }

    // Close existing connection if it's in a bad state
    if (wsRefs.current[wserver.id] && wsRefs.current[wserver.id].readyState !== WebSocket.CLOSED) {
      wsRefs.current[wserver.id].close()
    }

    // Set connecting status
    setConnectionStatuses(prev => ({
      ...prev,
      [wserver.id]: 'connecting'
    }))

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

      // Send initial pm2-list request
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ uuid: wserver.uuid, token: wserver.token, command: 'pm2-list' }))
        }
      }, 100) // Small delay to ensure auth is processed

      // Intervals are managed by useEffect based on activeTab
    }

    ws.onmessage = (event) => {
      try {
        const message = event.data

        // Try to parse as JSON first
        const parsedMessage = JSON.parse(message)

        // Check if it's pm2-list response
        if (parsedMessage.type === 'pm2-list') {
          setPm2Data(prev => ({
            ...prev,
            [wserver.id]: parsedMessage.data || []
          }))
          setConnectionStatuses(prev => ({
            ...prev,
            [wserver.id]: 'online'
          }))
        } else if (parsedMessage.pong && parsedMessage.status === 'ok') {
          // Handle ping response - connection is healthy
          return
        } else {
          // Other messages
          setConnectionStatuses(prev => ({
            ...prev,
            [wserver.id]: 'online'
          }))
        }
      } catch (error) {
        console.error('Failed to parse server message:', error)
        setConnectionStatuses(prev => ({
          ...prev,
          [wserver.id]: 'offline'
        }))
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error for server', wserver.servername, error)
      setConnectionStatuses(prev => ({
        ...prev,
        [wserver.id]: 'offline'
      }))
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed for server', wserver.servername, 'code:', event.code)
      setConnectionStatuses(prev => ({
        ...prev,
        [wserver.id]: 'offline'
      }))
      // Note: No automatic reconnection - connection stays closed until page refresh or manual reconnect
    }

    wsRefs.current[wserver.id] = ws
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (ms: number) => {
    if (!ms) return 'N/A'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const handleAction = async (serverId: string, action: string, processName: string) => {
    const ws = wsRefs.current[serverId]
    const wserver = wservers.find(s => s.id === serverId)
    if (ws && ws.readyState === WebSocket.OPEN && wserver) {
      const command = `pm2-${action}`
      const message: any = {
        command,
        name: processName,
        uuid: wserver.uuid,
        token: wserver.token
      }
      if (action === 'start') {
        message.script = processName // Assuming name is the script path
      }
      ws.send(JSON.stringify(message))
      // After action, refresh the list
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ command: 'pm2-list', uuid: wserver.uuid, token: wserver.token }))
        }
      }, 1000)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-white mb-4">PM2 Management</h3>

      {wservers.map((wserver) => {
        const processes = pm2Data[wserver.id] || []
        const connectionStatus = connectionStatuses[wserver.id] || 'connecting'

        return (
          <div key={wserver.id} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-medium">{wserver.servername}</h4>
              <span className={`text-sm ${
                connectionStatus === 'online' ? 'text-green-400' :
                connectionStatus === 'connecting' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Server</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">ID</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">PID</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">CPU</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Memory</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Uptime</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">↻</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {processes.map((process) => (
                    <tr
                      key={`${wserver.id}-${process.pm_id}`}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setContextMenu({ x: e.clientX, y: e.clientY, process, serverId: wserver.id })
                      }}
                    >
                      <td className="px-4 py-2 text-white">{wserver.servername}</td>
                      <td className="px-4 py-2 text-white">{process.pm_id}</td>
                      <td className="px-4 py-2 text-white">{process.name}</td>
                      <td className="px-4 py-2 text-white">{process.pid}</td>
                      <td className="px-4 py-2 text-white">
                        <span className={`px-2 py-1 rounded text-xs ${
                          process.pm2_env.status === 'online' ? 'bg-green-600 text-white' :
                          process.pm2_env.status === 'stopped' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {process.pm2_env.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-white">{process.monit.cpu.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-white">{formatBytes(process.monit.memory)}</td>
                      <td className="px-4 py-2 text-white">{process.pm2_env.status === 'online' ? formatUptime(Date.now() - process.pm2_env.pm_uptime) : 'N/A'}</td>
                      <td className="px-4 py-2 text-white">{process.pm2_env.restart_time}</td>
                    </tr>
                  ))}
                  {processes.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        No PM2 processes found or connecting...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {wservers.length === 0 && (
        <p className="text-gray-400 text-center py-8">No servers configured. Add servers in the WServer tab.</p>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.process.pm2_env.status === 'online' ? (
            <>
              <button
                onClick={() => {
                  handleAction(contextMenu.serverId, 'restart', contextMenu.process.name)
                  setContextMenu(null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Restart
              </button>
              <button
                onClick={() => {
                  handleAction(contextMenu.serverId, 'stop', contextMenu.process.name)
                  setContextMenu(null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                handleAction(contextMenu.serverId, 'start', contextMenu.process.name)
                setContextMenu(null)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              Start
            </button>
          )}
          <button
            onClick={() => {
              handleAction(contextMenu.serverId, 'delete', contextMenu.process.name)
              setContextMenu(null)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}