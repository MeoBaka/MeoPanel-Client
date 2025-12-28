'use client'

import { useState, useEffect, useRef } from 'react'
// import { Terminal } from 'xterm'
// import { FitAddon } from 'xterm-addon-fit'
// import 'xterm/css/xterm.css'

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
  const [selectedProcesses, setSelectedProcesses] = useState<Record<string, Set<string>>>({})
  const [logsModal, setLogsModal] = useState<{serverId: string, process: PM2Process, logs: string[], command: string} | null>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)
  const logsListenerRef = useRef<((event: MessageEvent) => void) | null>(null)

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

  useEffect(() => {
    if (autoScrollEnabled && logsContainerRef.current && logsModal) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logsModal?.logs, autoScrollEnabled])

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
        } else if (parsedMessage.type === 'error') {
          console.error('Server error:', parsedMessage.message);
          alert(`Error: ${parsedMessage.message}`);
        } else if (parsedMessage.type === 'pm2-send') {
          console.log('Data sent to process successfully');
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

  const handleAction = async (serverId: string, action: string, process: PM2Process) => {
    const ws = wsRefs.current[serverId]
    const wserver = wservers.find(s => s.id === serverId)
    if (ws && ws.readyState === WebSocket.OPEN && wserver) {
      const command = `pm2-${action}`
      const message: any = {
        command,
        uuid: wserver.uuid,
        token: wserver.token
      }
      if (action === 'start') {
        message.script = process.name
        message.name = process.name
      } else {
        message.id = process.pm_id
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

  const handleBulkAction = async (serverId: string, action: string) => {
    const selected = selectedProcesses[serverId] || new Set()
    if (selected.size === 0) return

    const ws = wsRefs.current[serverId]
    const wserver = wservers.find(s => s.id === serverId)
    if (ws && ws.readyState === WebSocket.OPEN && wserver) {
      const command = `pm2-multi-${action}`
      const message: any = {
        command,
        uuid: wserver.uuid,
        token: wserver.token
      }
      if (action === 'start') {
        const processes = Array.from(selected).map(name => {
          const proc = pm2Data[serverId].find(p => p.name === name)
          return proc ? { script: proc.name, name: proc.name } : null
        }).filter(Boolean)
        message.processes = processes
      } else {
        const ids = Array.from(selected).map(name => {
          const proc = pm2Data[serverId].find(p => p.name === name)
          return proc ? proc.pm_id : null
        }).filter(Boolean) as number[]
        message.ids = ids
      }
      ws.send(JSON.stringify(message))
      // Clear selection and refresh the list
      setSelectedProcesses(prev => ({ ...prev, [serverId]: new Set() }))
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ command: 'pm2-list', uuid: wserver.uuid, token: wserver.token }))
        }
      }, 1000)
    }
  }

  const handleGlobalAction = async (serverId: string, action: string) => {
    const ws = wsRefs.current[serverId]
    const wserver = wservers.find(s => s.id === serverId)
    if (ws && ws.readyState === WebSocket.OPEN && wserver) {
      const command = `pm2-${action}`
      ws.send(JSON.stringify({
        command,
        uuid: wserver.uuid,
        token: wserver.token
      }))
      // Refresh the list
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ command: 'pm2-list', uuid: wserver.uuid, token: wserver.token }))
        }
      }, 1000)
    }
  }

  const handleCheckboxChange = (serverId: string, processName: string, checked: boolean) => {
    setSelectedProcesses(prev => {
      const current = prev[serverId] || new Set()
      const newSet = new Set(current)
      if (checked) {
        newSet.add(processName)
      } else {
        newSet.delete(processName)
      }
      return { ...prev, [serverId]: newSet }
    })
  }

  const handleSelectAll = (serverId: string, checked: boolean) => {
    const processes = pm2Data[serverId] || []
    setSelectedProcesses(prev => ({
      ...prev,
      [serverId]: checked ? new Set(processes.map(p => p.name)) : new Set()
    }))
  }

  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setAutoScrollEnabled(isAtBottom)
    }
  }

  const openLogsModal = async (serverId: string, process: PM2Process) => {
    const ws = wsRefs.current[serverId]
    const wserver = wservers.find(s => s.id === serverId)
    if (ws && ws.readyState === WebSocket.OPEN && wserver) {
      setLogsModal({
        serverId,
        process,
        logs: ['Loading logs...'],
        command: ''
      })
      // Request logs
      ws.send(JSON.stringify({
        command: 'pm2-logs',
        id: process.pm_id,
        uuid: wserver.uuid,
        token: wserver.token
      }))

      // Set up message handler for logs response
      let isInitial = true;
      let received = false;
      const handleLogsResponse = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'pm2-logs') {
            received = true;
            setLogsModal(prev => {
              if (!prev) return null;
              if (isInitial) {
                isInitial = false;
                return { ...prev, logs: message.data }
              } else {
                return { ...prev, logs: [...prev.logs, ...message.data] }
              }
            })
          }
        } catch (error) {
          // Ignore parse errors
        }
      }

      logsListenerRef.current = handleLogsResponse;
      ws.addEventListener('message', handleLogsResponse)

      // Fallback timeout
      setTimeout(() => {
        if (!received) {
          setLogsModal(prev => {
            if (prev && prev.logs.length === 1 && prev.logs[0] === 'Loading logs...') {
              return { ...prev, logs: ['Failed to load logs'] }
            }
            return prev
          })
        }
      }, 5000)
    }
  }

  const sendCommand = (serverId: string, process: PM2Process, command: string) => {
    const ws = wsRefs.current[serverId]
    const wserver = wservers.find(s => s.id === serverId)
    if (ws && ws.readyState === WebSocket.OPEN && wserver && command.trim()) {
      ws.send(JSON.stringify({
        command: 'pm2-send',
        id: process.pm_id,
        data: command,
        uuid: wserver.uuid,
        token: wserver.token
      }))
      // Clear command
      setLogsModal(prev => prev ? { ...prev, command: '' } : null)
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

            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => handleBulkAction(wserver.id, 'start')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={(selectedProcesses[wserver.id]?.size || 0) === 0}
                >
                  Start Selected
                </button>
                <button
                  onClick={() => handleBulkAction(wserver.id, 'stop')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={(selectedProcesses[wserver.id]?.size || 0) === 0}
                >
                  Stop Selected
                </button>
                <button
                  onClick={() => handleBulkAction(wserver.id, 'restart')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={(selectedProcesses[wserver.id]?.size || 0) === 0}
                >
                  Restart Selected
                </button>
                <button
                  onClick={() => handleBulkAction(wserver.id, 'delete')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                  disabled={(selectedProcesses[wserver.id]?.size || 0) === 0}
                >
                  Delete Selected
                </button>
              </div>

              <div className="flex gap-2 mb-2">

                <button

                  onClick={() => handleGlobalAction(wserver.id, 'save')}

                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"

                >

                  Save

                </button>

                <button

                  onClick={() => handleGlobalAction(wserver.id, 'resurrect')}

                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"

                >

                  Resurrect

                </button>

              </div>

            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">
                      <input
                        type="checkbox"
                        checked={processes.length > 0 && (selectedProcesses[wserver.id]?.size || 0) === processes.length}
                        onChange={(e) => handleSelectAll(wserver.id, e.target.checked)}
                        className="rounded"
                      />
                    </th>
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
                      <td className="px-4 py-2 text-white">
                        <input
                          type="checkbox"
                          checked={selectedProcesses[wserver.id]?.has(process.name) || false}
                          onChange={(e) => handleCheckboxChange(wserver.id, process.name, e.target.checked)}
                          className="rounded"
                        />
                      </td>
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
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
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
                  handleAction(contextMenu.serverId, 'restart', contextMenu.process)
                  setContextMenu(null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Restart
              </button>
              <button
                onClick={() => {
                  handleAction(contextMenu.serverId, 'stop', contextMenu.process)
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
                handleAction(contextMenu.serverId, 'start', contextMenu.process)
                setContextMenu(null)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              Start
            </button>
          )}
          <button
            onClick={() => {
              openLogsModal(contextMenu.serverId, contextMenu.process)
              setContextMenu(null)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            View Logs
          </button>
          <button
            onClick={() => {
              handleAction(contextMenu.serverId, 'delete', contextMenu.process)
              setContextMenu(null)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}

      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 w-3/4 max-w-4xl max-h-3/4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                Logs for {logsModal.process.name}
              </h3>
              <div className="flex items-center">
                <button
                  onClick={() => openLogsModal(logsModal.serverId, logsModal.process)}
                  className="text-gray-400 hover:text-white mr-2"
                  title="Refresh logs"
                >
                  🔄
                </button>
                <button
                  onClick={() => {
                    if (logsModal) {
                      const ws = wsRefs.current[logsModal.serverId];
                      const wserver = wservers.find(s => s.id === logsModal.serverId)
                      if (wserver && ws?.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                          command: 'pm2-stop-logs',
                          id: logsModal.process.pm_id,
                          uuid: wserver.uuid,
                          token: wserver.token
                        }));
                        if (logsListenerRef.current) {
                          ws.removeEventListener('message', logsListenerRef.current);
                          logsListenerRef.current = null;
                        }
                      }
                    }
                    setLogsModal(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div ref={logsContainerRef} onScroll={handleScroll} className="flex-1 bg-black rounded p-4 mb-4 overflow-auto max-h-96">
              <pre className="text-green-400 text-sm whitespace-pre-wrap">
                {logsModal.logs.join('\n')}
              </pre>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={logsModal.command}
                onChange={(e) => setLogsModal(prev => prev ? { ...prev, command: e.target.value } : null)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendCommand(logsModal.serverId, logsModal.process, logsModal.command)
                  }
                }}
                placeholder="Enter data to send to process (e.g., 5+5)"
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm"
              />
              <button
                onClick={() => sendCommand(logsModal.serverId, logsModal.process, logsModal.command)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}