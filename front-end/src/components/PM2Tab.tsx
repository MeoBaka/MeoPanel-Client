'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { usePM2Data } from '@/contexts/PM2DataContext'
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
    pm_cwd: string
  }
  note?: string
}


interface User {
  id: string
  username: string
  email: string
  role: string
}

interface PM2Permission {
   id: string
   userId: string
   wserverId: string
   pm2ProcessName: string
   permissions: string[]
 }

interface TreeItem {
   name: string
   isDirectory: boolean
   children: TreeItem[]
   expanded: boolean
   path: string
 }

interface PM2TabProps {
  activeTab: string
  user: User | null
}

export default function PM2Tab({ activeTab, user }: PM2TabProps) {
     const { connectToServer, sendToServer, isConnected } = useWebSocket()
     const { updatePM2Data } = usePM2Data()

    const isImageFile = (filename: string): boolean => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
        const ext = filename.split('.').pop()?.toLowerCase()
        return ext ? imageExtensions.includes(ext) : false
    }

    const getMimeType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase()
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'jpeg'
            case 'png':
                return 'png'
            case 'gif':
                return 'gif'
            case 'bmp':
                return 'bmp'
            case 'webp':
                return 'webp'
            case 'svg':
                return 'svg+xml'
            default:
                return 'png'
        }
    }

    const buildTree = (files: any[], currentPath: string): TreeItem[] => {
        return files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory,
            children: [],
            expanded: false,
            path: currentPath ? `${currentPath}/${file.name}` : file.name
        }))
    }

    const renderTree = (items: TreeItem[], level: number = 0): JSX.Element[] => {
        return items.map((item, index) => {
            const currentItem = item
            return (
                <div key={item.path}>
                    <div
                        className={`flex items-center p-1 rounded cursor-pointer hover:bg-gray-700 text-sm ${
                            fileBrowserModal!.selectedFiles.has(item.path) ? 'bg-blue-600 text-white' : item.isDirectory ? 'text-blue-400' : 'text-gray-300'
                        }`}
                        style={{ paddingLeft: `${level * 16 + 4}px` }}
                    onClick={(e) => {
                        if (item.isDirectory) {
                            // Toggle expand
                            if (!item.expanded && item.children.length === 0) {
                                // Load children
                                setFileBrowserModal(prev => prev ? { ...prev, loadingTreePath: item.path } : null)
                                const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                    const token = fileBrowserModal!.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
                                    sendToServer(fileBrowserModal!.serverId, {
                                        command: 'pm2-list-files',
                                        id: fileBrowserModal!.process.pm_id,
                                        relativePath: item.path,
                                        uuid: wserver.uuid,
                                        token: token
                                    })
                                    // Will update treeData when response comes
                                }
                            }
                            setFileBrowserModal(prev => {
                                if (!prev) return prev
                                const updateTree = (tree: TreeItem[]): TreeItem[] => {
                                    return tree.map(t => {
                                        if (t.path === item.path) {
                                            return { ...t, expanded: !t.expanded }
                                        }
                                        if (t.children) {
                                            return { ...t, children: updateTree(t.children) }
                                        }
                                        return t
                                    })
                                }
                                return { ...prev, treeData: updateTree(prev.treeData) }
                            })
                        } else {
                            // Select file
                            setFileBrowserModal(prev => prev ? { ...prev, selectedFiles: new Set([item.path]) } : null)
                        }
                    }}
                    onDoubleClick={() => {
                        if (item.isDirectory) {
                            // Navigate
                            setFileBrowserModal(prev => prev ? { ...prev, currentPath: item.path } : null)
                            const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                            if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                const token = fileBrowserModal!.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
                                sendToServer(fileBrowserModal!.serverId, {
                                    command: 'pm2-list-files',
                                    id: fileBrowserModal!.process.pm_id,
                                    relativePath: item.path,
                                    uuid: wserver.uuid,
                                    token: token
                                })
                            }
                        } else {
                            // Open file
                            setFileBrowserModal(prev => {
                                if (!prev) return null
                                const existingIndex = prev.openFiles.findIndex(f => f.path === item.path)
                                if (existingIndex >= 0) {
                                    return { ...prev, activeTabIndex: existingIndex }
                                } else {
                                    const newOpenFiles = [...prev.openFiles, { file: { name: item.name, isDirectory: false }, content: '', path: item.path, originalContent: '', modified: false }]
                                    return { ...prev, openFiles: newOpenFiles, activeTabIndex: newOpenFiles.length - 1 }
                                }
                            })
                            const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                            if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                sendToServer(fileBrowserModal!.serverId, {
                                    command: 'pm2-read-file',
                                    id: fileBrowserModal!.process.pm_id,
                                    relativePath: item.path,
                                    uuid: wserver.uuid,
                                    token: wserver.token
                                })
                            }
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault()
                        setFileBrowserModal(prev => prev ? { ...prev, contextMenu: { x: e.clientX, y: e.clientY, file: { name: item.name, isDirectory: item.isDirectory } } } : null)
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const files = Array.from(e.dataTransfer.files)
                            const targetPath = item.isDirectory ? item.path : (item.path.includes('/') ? item.path.substring(0, item.path.lastIndexOf('/')) : '')
                            files.forEach(f => uploadFile(f, targetPath))
                            return
                        }
                        if (item.isDirectory && !item.expanded) {
                            const draggedPath = e.dataTransfer.getData('text/plain')
                            if (draggedPath && draggedPath !== item.path) {
                                const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                    sendToServer(fileBrowserModal!.serverId, {
                                        command: 'pm2-move-file',
                                        id: fileBrowserModal!.process.pm_id,
                                        sourcePath: draggedPath,
                                        destinationPath: item.path,
                                        uuid: wserver.uuid,
                                        token: wserver.token
                                    })
                                    // Refresh file list
                                    setTimeout(() => {
                                        sendToServer(fileBrowserModal!.serverId, {
                                            command: 'pm2-list-files',
                                            id: fileBrowserModal!.process.pm_id,
                                            relativePath: fileBrowserModal!.currentPath,
                                            uuid: wserver.uuid,
                                            token: wserver.token
                                        })
                                    }, 500)
                                }
                            }
                        }
                    }}
                    onDragOver={(e) => {
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'copy'
                        } else if (item.isDirectory && !item.expanded) {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                        }
                    }}
                >
                    {item.isDirectory ? (
                        <span className="mr-1">{item.expanded ? '▼' : '▶'}</span>
                    ) : (
                        <span className="mr-1">📄</span>
                    )}
                    <span>{item.name}</span>
                </div>
                {item.expanded && item.children.length > 0 && (
                    <div>
                        {renderTree(item.children, level + 1)}
                    </div>
                )}
            </div>
        )}        )
    }
    const [wservers, setWservers] = useState<WServer[]>([])
    const [allServers, setAllServers] = useState<WServer[]>([])
    const [pm2Data, setPm2Data] = useState<Record<string, PM2Process[]>>({})
    const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'connecting' | 'online' | 'offline'>>({})
    const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({})
    const [contextMenu, setContextMenu] = useState<{x: number, y: number, process: PM2Process, serverId: string} | null>(null)
    const [selectedProcesses, setSelectedProcesses] = useState<Record<string, Set<string>>>({})
    const [logsModal, setLogsModal] = useState<{serverId: string, process: PM2Process, logs: string[], command: string} | null>(null)
    const [fileBrowserModal, setFileBrowserModal] = useState<{serverId: string, process: PM2Process, currentPath: string, files: any[], treeData: TreeItem[], loadingTreePath: string | null, isTreeView: boolean, uploadTargetPath: string | null, openFiles: {file: any, content: string, path: string, originalContent: string, modified: boolean}[], activeTabIndex: number, sidebarWidth: number, wordWrap: boolean, sidebarVisible: boolean, selectedFiles: Set<string>, clipboard: {type: 'cut' | 'copy', files: any[]} | null, contextMenu: {x: number, y: number, file: any} | null, isSelecting: boolean, selectionStart: number | null, renamingFile: string | null, zippingProgress: number | null, uploadProgress: { fileName: string, progress: number } | null} | null>(null)
    const [saveToast, setSaveToast] = useState<string | null>(null)
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
    const [collapsedServers, setCollapsedServers] = useState<Record<string, boolean>>({})
    const terminalRef = useRef<HTMLDivElement>(null)
    const logsContainerRef = useRef<HTMLDivElement>(null)
    const logsListenerRef = useRef<((event: MessageEvent, serverId: string) => void) | null>(null)
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const [isResizing, setIsResizing] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startWidth, setStartWidth] = useState(256)
    const [userPermissions, setUserPermissions] = useState<PM2Permission[]>([])
    const [permissionsLoading, setPermissionsLoading] = useState(true)

   useEffect(() => {
     const handleClickOutside = () => setContextMenu(null)
     document.addEventListener('click', handleClickOutside)
     return () => document.removeEventListener('click', handleClickOutside)
   }, [])

   useEffect(() => {
     const handleClickOutsideFileBrowser = () => {
       if (fileBrowserModal?.contextMenu) {
         setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
       }
     }
     document.addEventListener('click', handleClickOutsideFileBrowser)
     return () => document.removeEventListener('click', handleClickOutsideFileBrowser)
   }, [fileBrowserModal?.contextMenu])

   // Prevent body scrolling when file browser modal is open
   useEffect(() => {
     if (fileBrowserModal) {
       document.body.style.overflow = 'hidden'
     } else {
       document.body.style.overflow = ''
     }
     return () => {
       document.body.style.overflow = ''
     }
   }, [fileBrowserModal])

   useEffect(() => {
     const handleMouseMove = (e: MouseEvent) => {
       if (isResizing && fileBrowserModal) {
         const newWidth = Math.max(200, Math.min(600, startWidth + (e.clientX - startX)))
         setFileBrowserModal(prev => prev ? { ...prev, sidebarWidth: newWidth } : null)
       }
     }
     const handleMouseUp = () => {
       setIsResizing(false)
     }
     if (isResizing) {
       document.addEventListener('mousemove', handleMouseMove)
       document.addEventListener('mouseup', handleMouseUp)
     }
     return () => {
       document.removeEventListener('mousemove', handleMouseMove)
       document.removeEventListener('mouseup', handleMouseUp)
     }
   }, [isResizing, startX, startWidth, fileBrowserModal])

   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (fileBrowserModal && e.ctrlKey) {
         switch (e.key) {
           case 's':
             e.preventDefault()
             if (fileBrowserModal.activeTabIndex >= 0) {
               const activeFile = fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex]
               const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
               if (wserver && isConnected(fileBrowserModal.serverId)) {
                 const isImage = isImageFile(activeFile.file.name)
                 const contentToSend = isImage ? activeFile.content : btoa(activeFile.content)
                 sendToServer(fileBrowserModal.serverId, {
                   command: 'pm2-write-file',
                   id: fileBrowserModal.process.pm_id,
                   relativePath: activeFile.path,
                   content: contentToSend,
                   uuid: wserver.uuid,
                   token: wserver.token
                 });
                 // Show notification immediately
                 setSaveToast('File saved successfully')
                 setTimeout(() => setSaveToast(null), 3000)
                 // Update local state
                 setFileBrowserModal(prev => {
                   if (!prev || prev.activeTabIndex < 0) return prev
                   const newOpenFiles = [...prev.openFiles]
                   newOpenFiles[prev.activeTabIndex].originalContent = newOpenFiles[prev.activeTabIndex].content
                   newOpenFiles[prev.activeTabIndex].modified = false
                   return { ...prev, openFiles: newOpenFiles }
                 })
               }
             }
             break
           case 'a':
             e.preventDefault()
             const textarea = document.querySelector('textarea') as HTMLTextAreaElement
             if (textarea) {
               textarea.select()
             }
             break
           case 'x':
             e.preventDefault()
             document.execCommand('cut')
             break
           case 'c':
             e.preventDefault()
             document.execCommand('copy')
             break
           case 'v':
             e.preventDefault()
             document.execCommand('paste')
             break
         }
       }
     }
     if (fileBrowserModal) {
       document.addEventListener('keydown', handleKeyDown)
     }
     return () => {
       document.removeEventListener('keydown', handleKeyDown)
     }
   }, [fileBrowserModal, wservers, isConnected, sendToServer])
   const updateIntervals = useRef<Record<string, NodeJS.Timeout>>({})

   const onOpen = useCallback((ws: WebSocket, wserver: WServer) => {
     if (activeTab === 'pm2') {
       // For local server, use different authentication approach
       if (wserver.id === 'local') {
         const token = localStorage.getItem('accessToken')
         sendToServer(wserver.id, {
           uuid: wserver.uuid,
           token: token, // Use JWT token for local server
           command: 'pm2-list',
           timestamp: Date.now()
         })
       } else {
         sendToServer(wserver.id, { uuid: wserver.uuid, token: wserver.token, command: 'pm2-list', timestamp: Date.now() })
       }
       updateIntervals.current[wserver.id] = setTimeout(() => {}, 0)
     }
   }, [activeTab, sendToServer])

 
   const handleMessage = useCallback((event: MessageEvent, serverId: string) => {
    try {
      const message = event.data

      // Try to parse as JSON first
      const parsedMessage = JSON.parse(message)

      // Check if it's pm2-list response
      if (parsedMessage.type === 'pm2-list') {
        setPm2Data(prev => ({
          ...prev,
          [serverId]: parsedMessage.data || []
        }))
        setConnectionStatuses(prev => ({
          ...prev,
          [serverId]: 'online'
        }))
        // Calculate latency from pm2-list response
        if (parsedMessage.timestamp) {
          const latency = Date.now() - parsedMessage.timestamp
          setPingLatencies(prev => ({
            ...prev,
            [serverId]: latency
          }))
        }
      } else if (parsedMessage.type === 'error') {
        console.error('Server error:', parsedMessage.message);
        alert(`Error: ${parsedMessage.message}`);
      } else if (parsedMessage.type === 'pm2-send') {
        console.log('Data sent to process successfully');
        setNotification({ message: 'Data sent to process successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-start' && parsedMessage.status === 'success') {
        setNotification({ message: 'Process started successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-stop' && parsedMessage.status === 'success') {
        setNotification({ message: 'Process stopped successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-restart' && parsedMessage.status === 'success') {
        setNotification({ message: 'Process restarted successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-delete' && parsedMessage.status === 'success') {
        setNotification({ message: 'Process deleted successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-save' && parsedMessage.status === 'success') {
        setNotification({ message: 'Processes saved successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-resurrect' && parsedMessage.status === 'success') {
        setNotification({ message: 'Processes resurrected successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-logs') {
        // Handle logs response
        setLogsModal(prev => {
          if (!prev) return null;
          if (prev.logs.length === 1 && prev.logs[0] === 'Loading logs...') {
            return { ...prev, logs: parsedMessage.data }
          } else {
            return { ...prev, logs: [...prev.logs, ...parsedMessage.data] }
          }
        })
      } else if (parsedMessage.type === 'pm2-list-files') {
        setFileBrowserModal(prev => {
          if (!prev) return null
          if (prev.loadingTreePath) {
            // Update children
            const updateTree = (tree: TreeItem[]): TreeItem[] => {
              return tree.map(t => {
                if (t.path === prev.loadingTreePath) {
                  return { ...t, children: buildTree(parsedMessage.data, t.path), expanded: true }
                }
                if (t.children) {
                  return { ...t, children: updateTree(t.children) }
                }
                return t
              })
            }
            return { ...prev, treeData: updateTree(prev.treeData), loadingTreePath: null }
          } else {
            // Update current
            return { ...prev, files: parsedMessage.data, treeData: buildTree(parsedMessage.data, prev.currentPath) }
          }
        })
      } else if (parsedMessage.type === 'pm2-read-file') {
        setFileBrowserModal(prev => {
          if (!prev || prev.activeTabIndex < 0) return prev
          const newOpenFiles = [...prev.openFiles]
          const isImage = isImageFile(newOpenFiles[prev.activeTabIndex].file.name)
          const content = isImage ? parsedMessage.data : atob(parsedMessage.data)
          newOpenFiles[prev.activeTabIndex].content = content
          newOpenFiles[prev.activeTabIndex].originalContent = content
          newOpenFiles[prev.activeTabIndex].modified = false
          return { ...prev, openFiles: newOpenFiles }
        })
      } else if (parsedMessage.type === 'pm2-write-file') {
        setSaveToast('File saved successfully')
        setTimeout(() => {
          setSaveToast(null)
        }, 3000)
      } else if (parsedMessage.type === 'pm2-create-file') {
        setNotification({ message: 'File created successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-create-folder') {
        setNotification({ message: 'Folder created successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-delete-files') {
        setNotification({ message: 'Files deleted successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-rename-file') {
        setNotification({ message: 'File renamed successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-move-file') {
        setNotification({ message: 'File moved successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-paste-files') {
        setNotification({ message: 'Files pasted successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-zip-files') {
        setNotification({ message: 'Files zipped successfully', type: 'success' })
        setFileBrowserModal(prev => prev ? { ...prev, zippingProgress: null } : null)
      } else if (parsedMessage.type === 'pm2-zip-progress') {
        setFileBrowserModal(prev => prev ? { ...prev, zippingProgress: parsedMessage.progress } : null)
      } else if (parsedMessage.type === 'pm2-unzip-file') {
        setNotification({ message: 'File unzipped successfully', type: 'success' })
      } else if (parsedMessage.type === 'pm2-upload-file') {
        setNotification({ message: 'File uploaded successfully', type: 'success' })
        // Clear upload progress
        setFileBrowserModal(prev => prev ? { ...prev, uploadProgress: null } : null)
        // Refresh file list
        if (fileBrowserModal) {
          const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
          if (wserver && isConnected(fileBrowserModal.serverId)) {
            const token = fileBrowserModal.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
            sendToServer(fileBrowserModal.serverId, {
              command: 'pm2-list-files',
              id: fileBrowserModal.process.pm_id,
              relativePath: fileBrowserModal.currentPath,
              uuid: wserver.uuid,
              token: token
            })
          }
        }
      } else if (parsedMessage.type === 'pm2-download-file') {
        // Create download link
        const link = document.createElement('a')
        link.href = `data:application/octet-stream;base64,${parsedMessage.data.data}`
        link.download = parsedMessage.data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setNotification({ message: 'File downloaded successfully', type: 'success' })
      } else {
        // Other messages
        setConnectionStatuses(prev => ({
          ...prev,
          [serverId]: 'online'
        }))
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
    fetchWservers()
    fetchUserPermissions()
  }, [])

  useEffect(() => {
    if (activeTab !== 'pm2') return;

    // Connect to WebSocket for each wserver
    wservers.forEach(wserver => {
      connectToServer(wserver, handleMessage, onOpen)
    })

    return () => {
      // Cleanup realtime streams
      wservers.forEach(wserver => {
        if (isConnected(wserver.id)) {
          sendToServer(wserver.id, { uuid: wserver.uuid, token: wserver.token, command: 'pm2-stop-list' })
        }
      })
      Object.values(updateIntervals.current).forEach(clearTimeout)
      updateIntervals.current = {}
    }
  }, [wservers, activeTab, connectToServer, handleMessage, onOpen])

  useEffect(() => {
    // Start or stop realtime updates based on activeTab
    wservers.forEach(wserver => {
      if (isConnected(wserver.id)) {
        if (activeTab === 'pm2') {
          // Start realtime updates if not already running
          if (!updateIntervals.current[wserver.id]) {
            // Send pm2-list to start realtime stream
            const token = wserver.id === 'local' ? localStorage.getItem('accessToken') : wserver.token
            sendToServer(wserver.id, { uuid: wserver.uuid, token: token, command: 'pm2-list', timestamp: Date.now() })
            updateIntervals.current[wserver.id] = setTimeout(() => {}, 0) // Placeholder to mark as started
          }
        } else {
          // Stop realtime updates when not active
          if (updateIntervals.current[wserver.id]) {
            // Send pm2-stop-list to stop the stream
            sendToServer(wserver.id, { uuid: wserver.uuid, token: wserver.token, command: 'pm2-stop-list' })
            clearTimeout(updateIntervals.current[wserver.id])
            delete updateIntervals.current[wserver.id]
          }
        }
      }
    })
  }, [activeTab, wservers, isConnected, sendToServer])


  useEffect(() => {
    if (autoScrollEnabled && logsContainerRef.current && logsModal) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logsModal?.logs, autoScrollEnabled])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchWservers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/wservers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const responseData = await response.json()
        const allServers = responseData.data || []
        const localServer = allServers.find((s: WServer) => s.servername === 'Local Server')
        if (localServer) {
          // Use local server from database
          setWservers([localServer, ...allServers.filter((s: WServer) => s.servername !== 'Local Server')])
        } else {
          // No local server in database, use remote servers only
          setWservers(allServers)
        }
      } else {
        // If not authorized or other error, no servers
        console.log('Not authorized to fetch wservers')
        setWservers([])
      }
    } catch (error) {
      console.error('Failed to fetch wservers:', error)
      // If fetching fails, no servers
      setWservers([])
    }
  }

  const fetchUserPermissions = async () => {
    if (!user) {
      setPermissionsLoading(false)
      return
    }
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/pm2-permissions/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserPermissions(data)
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
    } finally {
      setPermissionsLoading(false)
    }
  }


  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (ms: number) => {
    if (!ms || ms <= 0) return '--:--:--'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getServerStats = (processes: PM2Process[]) => {
    const total = processes.length
    const running = processes.filter(p => p.pm2_env.status === 'online').length
    const stopped = processes.filter(p => p.pm2_env.status === 'stopped').length
    const error = processes.filter(p => p.pm2_env.status === 'errored').length
    return { total, running, stopped, error }
  }

  const hasPermission = (serverId: string, processName: string, permission: string): boolean => {
    // Admins and owners have all permissions
    if (user && (user.role === 'ADMIN' || user.role === 'OWNER')) {
      return true
    }

    // Check user permissions
    const permissionRecord = userPermissions.find(
      p => p.wserverId === serverId && p.pm2ProcessName === processName
    )
    return permissionRecord ? permissionRecord.permissions.includes(permission) : false
  }

  const getTotalSelected = () => {
    return Object.values(selectedProcesses).reduce((total, set) => total + set.size, 0)
  }

  const getSelectedList = () => {
    const list: {serverName: string, processName: string}[] = []
    wservers.forEach(wserver => {
      const selected = selectedProcesses[wserver.id] || new Set()
      selected.forEach(processName => {
        list.push({ serverName: wserver.servername, processName })
      })
    })
    return list
  }

  const handleAction = async (serverId: string, action: string, process: PM2Process) => {
    const wserver = wservers.find(s => s.id === serverId)
    if (isConnected(serverId) && wserver) {
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
      sendToServer(serverId, message)
      // After action, refresh the list
      setTimeout(() => {
        if (isConnected(serverId)) {
          sendToServer(serverId, { command: 'pm2-list', uuid: wserver.uuid, token: wserver.token })
        }
      }, 1000)
    }
  }

  const handleBulkAction = async (action: string) => {
    const totalSelected = getTotalSelected()
    if (totalSelected === 0) return

    // Group selected processes by server
    const serverGroups: Record<string, string[]> = {}
    wservers.forEach(wserver => {
      const selected = selectedProcesses[wserver.id] || new Set()
      if (selected.size > 0) {
        serverGroups[wserver.id] = Array.from(selected)
      }
    })

    // Send commands to each server
    Object.entries(serverGroups).forEach(([serverId, processNames]) => {
      const wserver = wservers.find(s => s.id === serverId)
      if (isConnected(serverId) && wserver) {
        const command = `pm2-multi-${action}`
        const message: any = {
          command,
          uuid: wserver.uuid,
          token: wserver.token
        }
        if (action === 'start') {
          const processes = processNames.map(name => {
            const proc = pm2Data[serverId].find(p => p.name === name)
            return proc ? { script: proc.name, name: proc.name } : null
          }).filter(Boolean)
          message.processes = processes
        } else {
          const ids = processNames.map(name => {
            const proc = pm2Data[serverId].find(p => p.name === name)
            return proc ? proc.pm_id : null
          }).filter(Boolean) as number[]
          message.ids = ids
        }
        sendToServer(serverId, message)
        // Refresh the list for this server
        setTimeout(() => {
          if (isConnected(serverId)) {
            sendToServer(serverId, { command: 'pm2-list', uuid: wserver.uuid, token: wserver.token })
          }
        }, 1000)
      }
    })

    // Clear all selections
    setSelectedProcesses({})
  }

  const handleGlobalAction = async (serverId: string, action: string) => {
    const wserver = wservers.find(s => s.id === serverId)
    if (isConnected(serverId) && wserver) {
      const command = `pm2-${action}`
      const token = serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
      sendToServer(serverId, {
        command,
        uuid: wserver.uuid,
        token: token
      })
      // Refresh the list
      setTimeout(() => {
        if (isConnected(serverId)) {
          sendToServer(serverId, {
            command: 'pm2-list',
            uuid: wserver.uuid,
            token: token
          })
        }
      }, 1000)
    }
  }



  const handleSelectAll = (serverId: string, checked: boolean) => {
    const processes = pm2Data[serverId] || []
    setSelectedProcesses(prev => ({
      ...prev,
      [serverId]: checked ? new Set(processes.map(p => p.name)) : new Set()
    }))
  }

  const handleSelectByStatus = (serverId: string, status: string) => {
    const processes = pm2Data[serverId] || []
    let filtered: PM2Process[] = []
    if (status === 'all') {
      filtered = processes
    } else if (status === 'running') {
      filtered = processes.filter(p => p.pm2_env.status === 'online')
    } else if (status === 'stopped') {
      filtered = processes.filter(p => p.pm2_env.status === 'stopped')
    } else if (status === 'error') {
      filtered = processes.filter(p => p.pm2_env.status === 'errored')
    } else if (status === 'unselect') {
      setSelectedProcesses(prev => ({ ...prev, [serverId]: new Set() }))
      return
    }
    setSelectedProcesses(prev => ({
      ...prev,
      [serverId]: new Set(filtered.map(p => p.name))
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
    const wserver = wservers.find(s => s.id === serverId)
    if (isConnected(serverId) && wserver) {
      setLogsModal({
        serverId,
        process,
        logs: ['Loading logs...'],
        command: ''
      })
      // Request logs
      sendToServer(serverId, {
        command: 'pm2-logs',
        id: process.pm_id,
        uuid: wserver.uuid,
        token: wserver.token
      })

      // Set up message handler for logs response
      let isInitial = true;
      let received = false;
      const handleLogsResponse = (event: MessageEvent, serverId: string) => {
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
      // Note: Since we're using shared context, we can't add event listeners directly.
      // The logs will be handled by the main message handler.

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

  const openFileBrowserModal = async (serverId: string, process: PM2Process) => {
    const wserver = wservers.find(s => s.id === serverId)
    if (isConnected(serverId) && wserver) {
      setFileBrowserModal({
        serverId,
        process,
        currentPath: '',
        files: [],
        treeData: [],
        loadingTreePath: null,
        isTreeView: true,
        uploadTargetPath: null,
        openFiles: [],
        activeTabIndex: -1,
        sidebarWidth: 256,
        wordWrap: true,
        sidebarVisible: true,
        selectedFiles: new Set(),
        clipboard: null,
        contextMenu: null,
        isSelecting: false,
        selectionStart: null,
        renamingFile: null,
        zippingProgress: null,
        uploadProgress: null
      })
      // Request files
      const token = serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
      sendToServer(serverId, {
        command: 'pm2-list-files',
        id: process.pm_id,
        relativePath: '',
        uuid: wserver.uuid,
        token: token
      })
    }
  }

  const sendCommand = (serverId: string, process: PM2Process, command: string) => {
    const wserver = wservers.find(s => s.id === serverId)
    if (isConnected(serverId) && wserver && command.trim()) {
      sendToServer(serverId, {
        command: 'pm2-send',
        id: process.pm_id,
        data: command,
        uuid: wserver.uuid,
        token: wserver.token
      })
      // Clear command
      setLogsModal(prev => prev ? { ...prev, command: '' } : null)
    }
  }

  // File operations
  const createFile = (fileName: string) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      const filePath = fileBrowserModal.currentPath ? `${fileBrowserModal.currentPath}/${fileName}` : fileName
      const token = fileBrowserModal.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-create-file',
        id: fileBrowserModal.process.pm_id,
        relativePath: filePath,
        content: '',
        uuid: wserver.uuid,
        token: token
      })
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const createFolder = (folderName: string) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      const folderPath = fileBrowserModal.currentPath ? `${fileBrowserModal.currentPath}/${folderName}` : folderName
      const token = fileBrowserModal.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-create-folder',
        id: fileBrowserModal.process.pm_id,
        relativePath: folderPath,
        uuid: wserver.uuid,
        token: token
      })
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const renameFile = (oldPath: string, newName: string) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-rename-file',
        id: fileBrowserModal.process.pm_id,
        oldPath,
        newName,
        uuid: wserver.uuid,
        token: wserver.token
      })
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const deleteFiles = (filePaths: string[]) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      const token = fileBrowserModal.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-delete-files',
        id: fileBrowserModal.process.pm_id,
        filePaths,
        uuid: wserver.uuid,
        token: token
      })
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const copyFiles = (filePaths: string[]) => {
    if (!fileBrowserModal) return
    const files = fileBrowserModal.files.filter(f => filePaths.includes(fileBrowserModal.currentPath ? `${fileBrowserModal.currentPath}/${f.name}` : f.name))
    setFileBrowserModal(prev => prev ? { ...prev, clipboard: { type: 'copy', files }, selectedFiles: new Set() } : null)
  }

  const cutFiles = (filePaths: string[]) => {
    if (!fileBrowserModal) return
    const files = fileBrowserModal.files.filter(f => filePaths.includes(fileBrowserModal.currentPath ? `${fileBrowserModal.currentPath}/${f.name}` : f.name))
    setFileBrowserModal(prev => prev ? { ...prev, clipboard: { type: 'cut', files }, selectedFiles: new Set() } : null)
  }

  const pasteFiles = () => {
    if (!fileBrowserModal || !fileBrowserModal.clipboard) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-paste-files',
        id: fileBrowserModal.process.pm_id,
        clipboard: fileBrowserModal.clipboard,
        destinationPath: fileBrowserModal.currentPath,
        uuid: wserver.uuid,
        token: wserver.token
      })
      // Clear clipboard if it was cut
      if (fileBrowserModal.clipboard.type === 'cut') {
        setFileBrowserModal(prev => prev ? { ...prev, clipboard: null } : null)
      }
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const zipFiles = (filePaths: string[], zipName: string) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      setFileBrowserModal(prev => prev ? { ...prev, zippingProgress: 0 } : null)
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-zip-files',
        id: fileBrowserModal.process.pm_id,
        filePaths,
        zipName,
        uuid: wserver.uuid,
        token: wserver.token
      })
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const unzipFile = (zipPath: string) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-unzip-file',
        id: fileBrowserModal.process.pm_id,
        zipPath,
        destinationPath: fileBrowserModal.currentPath,
        uuid: wserver.uuid,
        token: wserver.token
      })
      // Refresh file list
      setTimeout(() => {
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-list-files',
          id: fileBrowserModal.process.pm_id,
          relativePath: fileBrowserModal.currentPath,
          uuid: wserver.uuid,
          token: wserver.token
        })
      }, 500)
    }
  }

  const uploadFile = (file: File, relativePath?: string | null) => {
    if (!fileBrowserModal) return
    const path = relativePath || fileBrowserModal.currentPath
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      // Show upload progress
      setFileBrowserModal(prev => prev ? { ...prev, uploadProgress: { fileName: file.name, progress: 0 } } : null)

      const reader = new FileReader()
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setFileBrowserModal(prev => prev ? { ...prev, uploadProgress: { fileName: file.name, progress } } : null)
        }
      }
      reader.onload = (e) => {
        setFileBrowserModal(prev => prev ? { ...prev, uploadProgress: { fileName: file.name, progress: 100 } } : null)
        const fileData = (e.target?.result as string).split(',')[1] // Remove data URL prefix
        const token = fileBrowserModal.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
        sendToServer(fileBrowserModal.serverId, {
          command: 'pm2-upload-file',
          id: fileBrowserModal.process.pm_id,
          relativePath: path,
          fileData,
          fileName: file.name,
          uuid: wserver.uuid,
          token: token
        })
        // Refresh file list immediately
        setTimeout(() => {
          sendToServer(fileBrowserModal.serverId, {
            command: 'pm2-list-files',
            id: fileBrowserModal.process.pm_id,
            relativePath: path,
            uuid: wserver.uuid,
            token: token
          })
        }, 100)
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadFile = (filePath: string) => {
    if (!fileBrowserModal) return
    const wserver = wservers.find(s => s.id === fileBrowserModal.serverId)
    if (wserver && isConnected(fileBrowserModal.serverId)) {
      const token = fileBrowserModal.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
      sendToServer(fileBrowserModal.serverId, {
        command: 'pm2-download-file',
        id: fileBrowserModal.process.pm_id,
        relativePath: filePath,
        uuid: wserver.uuid,
        token: token
      })
    }
  }

  const handleGlobalSelect = (status: string) => {
    let newSelected: Record<string, Set<string>> = {}
    if (status === 'all') {
      wservers.forEach(wserver => {
        const processes = pm2Data[wserver.id] || []
        newSelected[wserver.id] = new Set(processes.map(p => p.name))
      })
    } else if (status === 'running') {
      wservers.forEach(wserver => {
        const processes = pm2Data[wserver.id] || []
        newSelected[wserver.id] = new Set(processes.filter(p => p.pm2_env.status === 'online').map(p => p.name))
      })
    } else if (status === 'stopped') {
      wservers.forEach(wserver => {
        const processes = pm2Data[wserver.id] || []
        newSelected[wserver.id] = new Set(processes.filter(p => p.pm2_env.status === 'stopped').map(p => p.name))
      })
    } else if (status === 'error') {
      wservers.forEach(wserver => {
        const processes = pm2Data[wserver.id] || []
        newSelected[wserver.id] = new Set(processes.filter(p => p.pm2_env.status === 'errored').map(p => p.name))
      })
    } else if (status === 'unselect') {
      newSelected = {}
    }
    setSelectedProcesses(newSelected)
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">PM2 Management</h3>
        <div className="flex items-center">
          <span className="text-gray-300 text-sm mr-2">Global Select:</span>
          <select
            onChange={(e) => handleGlobalSelect(e.target.value)}
            className="bg-gray-700 text-gray-300 text-sm rounded px-2 py-1"
          >
            <option value="">Select...</option>
            <option value="all">All</option>
            <option value="running">Online</option>
            <option value="stopped">Stopped</option>
            <option value="error">Error</option>
            <option value="unselect">Unselect All</option>
          </select>
        </div>
      </div>

      {notification && (
        <div className={`mb-4 p-3 rounded ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {notification.message}
        </div>
      )}

      {wservers.map((wserver) => {
        const allProcesses = pm2Data[wserver.id] || []
        // Filter processes based on view permission
        const processes = user && (user.role === 'ADMIN' || user.role === 'OWNER')
          ? allProcesses
          : permissionsLoading
            ? [] // Show no processes while permissions are loading
            : allProcesses.filter(process => hasPermission(wserver.id, process.name, 'view'))
        const connectionStatus = connectionStatuses[wserver.id] || 'connecting'
        const stats = getServerStats(processes)
        const isCollapsed = collapsedServers[wserver.id] || false

        return (
          <div key={wserver.id} className="mb-8 bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gray-700">
              <div className="flex items-center">
                <button
                  onClick={() => setCollapsedServers(prev => ({ ...prev, [wserver.id]: !prev[wserver.id] }))}
                  className="text-white mr-2"
                >
                  {isCollapsed ? '▶' : '▼'}
                </button>
                <h4 className="text-white font-medium">{wserver.servername}</h4>
                <span className={`ml-2 text-sm ${
                  connectionStatus === 'online' ? 'text-green-400' :
                  connectionStatus === 'connecting' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {connectionStatus === 'connecting' ? 'Connecting...' :
                   connectionStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                {user && user.role !== 'ADMIN' && user.role !== 'OWNER' && <span>Version: 1.0.0</span>}
                <span>Amount: {stats.total}</span>
                <span>Run: {stats.running}</span>
                <span>Stop: {stats.stopped}</span>
                <span>Error: {stats.error}</span>
                <span>Ping: {pingLatencies[wserver.id] ? `${pingLatencies[wserver.id]}ms` : 'N/A'}</span>
                {(user && (user.role === 'ADMIN' || user.role === 'OWNER') || userPermissions.some(p => p.wserverId === wserver.id)) && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <>

            <div className="overflow-hidden">
              <table className="w-full text-sm text-left table-fixed">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="w-12 px-1 py-2 text-xs font-medium text-gray-300 uppercase">
                      <select
                        value=""
                        onChange={(e) => handleSelectByStatus(wserver.id, e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        className="bg-gray-700 text-gray-300 text-xs rounded px-0.5 py-1 w-full"
                      >
                        <option value="">☑</option>
                        <option value="all">All</option>
                        <option value="running">Online</option>
                        <option value="stopped">Stopped</option>
                        <option value="error">Error</option>
                        <option value="unselect">Unselect</option>
                      </select>
                    </th>
                    <th className="w-12 px-4 py-2 text-xs font-medium text-gray-300 uppercase">ID</th>
                    <th className="w-32 px-4 py-2 text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="w-16 px-4 py-2 text-xs font-medium text-gray-300 uppercase">PID</th>
                    <th className="w-20 px-4 py-2 text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="w-16 px-4 py-2 text-xs font-medium text-gray-300 uppercase">CPU</th>
                    <th className="w-20 px-4 py-2 text-xs font-medium text-gray-300 uppercase">Memory</th>
                    <th className="w-20 px-4 py-2 text-xs font-medium text-gray-300 uppercase">Uptime</th>
                    <th className="w-12 px-4 py-2 text-xs font-medium text-gray-300 uppercase">↻</th>
                    <th className="w-32 px-4 py-2 text-xs font-medium text-gray-300 uppercase">Note</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {processes.map((process) => (
                    <tr
                      key={`${wserver.id}-${process.pm_id}`}
                      className={selectedProcesses[wserver.id]?.has(process.name) ? 'bg-gray-700' : ''}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setContextMenu({ x: e.clientX, y: e.clientY, process, serverId: wserver.id })
                      }}
                    >
                      <td className="w-12 px-2 py-2 text-white">
                        <input
                          type="checkbox"
                          checked={selectedProcesses[wserver.id]?.has(process.name) || false}
                          onChange={(e) => {
                            setSelectedProcesses(prev => {
                              const current = prev[wserver.id] || new Set()
                              const newSet = new Set(current)
                              if (e.target.checked) {
                                newSet.add(process.name)
                              } else {
                                newSet.delete(process.name)
                              }
                              return { ...prev, [wserver.id]: newSet }
                            })
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="w-12 px-4 py-2 text-white">{process.pm_id}</td>
                      <td className="w-32 px-4 py-2 text-white">{process.name}</td>
                      <td className="w-16 px-4 py-2 text-white">{process.pid}</td>
                      <td className="w-20 px-4 py-2 text-white">
                        <span className={`px-2 py-1 rounded text-xs ${
                          process.pm2_env.status === 'online' ? 'bg-green-600 text-white' :
                          process.pm2_env.status === 'stopped' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {process.pm2_env.status}
                        </span>
                      </td>
                      <td className="w-16 px-4 py-2 text-white">{process.monit.cpu.toFixed(1)}%</td>
                      <td className="w-20 px-4 py-2 text-white">{formatBytes(process.monit.memory)}</td>
                      <td className="w-20 px-4 py-2 text-white">{process.pm2_env.status === 'online' ? formatUptime(Date.now() - process.pm2_env.pm_uptime) : 'N/A'}</td>
                      <td className="w-12 px-4 py-2 text-white">{process.pm2_env.restart_time}</td>
                      <td className="w-32 px-4 py-2 text-white">
                        {hasPermission(wserver.id, process.name, 'edit_note') ? (
                          <input
                            type="text"
                            value={process.note || ''}
                            onChange={(e) => {
                              const newNote = e.target.value;
                              setPm2Data(prev => ({
                                ...prev,
                                [wserver.id]: prev[wserver.id].map(p => p.name === process.name ? { ...p, note: newNote } : p)
                              }));
                            }}
                            onBlur={() => {
                              if (isConnected(wserver.id)) {
                                sendToServer(wserver.id, {
                                  command: 'pm2-notes-set',
                                  uuid: wserver.uuid,
                                  token: wserver.token,
                                  process_name: process.name,
                                  note: process.note || ''
                                });
                              }
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            className="bg-gray-700 text-white text-xs rounded px-1 py-1 w-full"
                            placeholder="Add note..."
                          />
                        ) : (
                          <span className="text-xs">{process.note || 'N/A'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {processes.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                        {permissionsLoading && user && user.role !== 'ADMIN' && user.role !== 'OWNER'
                          ? 'Loading permissions...'
                          : 'No PM2 processes found or connecting...'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </>
            )}
          </div>
        )
      })}

      {getTotalSelected() > 0 && (
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Selected Processes ({getTotalSelected()})</h4>
          <div className="mb-4 max-h-32 overflow-y-auto">
            {getSelectedList().map((item, index) => (
              <div key={index} className="text-gray-300 text-sm">
                {item.serverName} - {item.processName}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('start')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Start Selected
            </button>
            <button
              onClick={() => handleBulkAction('stop')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Stop Selected
            </button>
            <button
              onClick={() => handleBulkAction('restart')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Restart Selected
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedProcesses({})}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {wservers.length === 0 && (
        <p className="text-gray-400 text-center py-8">No servers configured. Add servers in the WServer tab.</p>
      )}

      {saveToast && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg text-center"
          style={{ zIndex: 10000 }}
        >
          {saveToast}
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.process.pm2_env.status === 'online' ? (
            <>
              {hasPermission(contextMenu.serverId, contextMenu.process.name, 'control') && (
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
              )}
            </>
          ) : (
            hasPermission(contextMenu.serverId, contextMenu.process.name, 'control') && (
              <button
                onClick={() => {
                  handleAction(contextMenu.serverId, 'start', contextMenu.process)
                  setContextMenu(null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Start
              </button>
            )
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
          {hasPermission(contextMenu.serverId, contextMenu.process.name, 'control_file') && (
            <button
              onClick={() => {
                openFileBrowserModal(contextMenu.serverId, contextMenu.process)
                setContextMenu(null)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              View File
            </button>
          )}
          {hasPermission(contextMenu.serverId, contextMenu.process.name, 'control') && (
            <button
              onClick={() => {
                handleAction(contextMenu.serverId, 'delete', contextMenu.process)
                setContextMenu(null)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-3/4 flex flex-col">
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
                      const wserver = wservers.find(s => s.id === logsModal.serverId)
                      if (wserver && isConnected(logsModal.serverId)) {
                        sendToServer(logsModal.serverId, {
                          command: 'pm2-stop-logs',
                          id: logsModal.process.pm_id,
                          uuid: wserver.uuid,
                          token: wserver.token
                        });
                        logsListenerRef.current = null;
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

            <div className="mb-4 bg-gray-700 rounded p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    logsModal.process.pm2_env.status === 'online' ? 'bg-green-600 text-white' :
                    logsModal.process.pm2_env.status === 'stopped' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {logsModal.process.pm2_env.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">CPU:</span>
                  <span className="ml-2 text-white">{logsModal.process.monit.cpu.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Memory:</span>
                  <span className="ml-2 text-white">{formatBytes(logsModal.process.monit.memory)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Uptime:</span>
                  <span className="ml-2 text-white">{logsModal.process.pm2_env.status === 'online' ? formatUptime(Date.now() - logsModal.process.pm2_env.pm_uptime) : 'N/A'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {logsModal.process.pm2_env.status !== 'online' && (
                  <button
                    onClick={() => handleAction(logsModal.serverId, 'start', logsModal.process)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Start
                  </button>
                )}
                {logsModal.process.pm2_env.status === 'online' && (
                  <>
                    <button
                      onClick={() => handleAction(logsModal.serverId, 'restart', logsModal.process)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => handleAction(logsModal.serverId, 'stop', logsModal.process)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Stop
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleAction(logsModal.serverId, 'delete', logsModal.process)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Delete
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

      {fileBrowserModal && (
        <div className="fixed inset-0 z-50 bg-gray-900 overflow-hidden">
          <div className="h-full flex flex-col max-h-screen">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-1 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">📁</span>
                <span className="text-white font-medium">{fileBrowserModal.process.name}</span>
                <span className="text-gray-400 mx-2">-</span>
                <span className="text-gray-300 text-sm">{fileBrowserModal.process.pm2_env.pm_cwd}{fileBrowserModal.currentPath}</span>
              </div>
              {(fileBrowserModal.zippingProgress !== null || fileBrowserModal.uploadProgress !== null) && (
                <div className="flex items-center mr-4 space-x-4">
                  {fileBrowserModal.zippingProgress !== null && (
                    <div className="flex items-center">
                      <span className="text-gray-300 text-sm mr-2">Zipping: {fileBrowserModal.zippingProgress}%</span>
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileBrowserModal.zippingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {fileBrowserModal.uploadProgress !== null && (
                    <div className="flex items-center">
                      <span className="text-gray-300 text-sm mr-2">Uploading {fileBrowserModal.uploadProgress.fileName}: {fileBrowserModal.uploadProgress.progress}%</span>
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileBrowserModal.uploadProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-2">
                {/* File Operations */}
                <input
                  type="file"
                  ref={uploadInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const path = fileBrowserModal!.uploadTargetPath
                      uploadFile(file, path)
                      setFileBrowserModal(prev => prev ? { ...prev, uploadTargetPath: null } : null)
                      e.target.value = '' // Reset input
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="text-gray-400 hover:text-white p-1"
                  title="Upload File"
                >
                  ⬆
                </button>
                <button
                  onClick={() => setFileBrowserModal(prev => prev ? { ...prev, isTreeView: !prev.isTreeView } : null)}
                  className="text-gray-400 hover:text-white p-1"
                  title={fileBrowserModal?.isTreeView ? 'Switch to List View' : 'Switch to Tree View'}
                >
                  {fileBrowserModal?.isTreeView ? '📂' : '📋'}
                </button>
                <button
                  onClick={() => {
                    if (fileBrowserModal!.selectedFiles.size > 0) {
                      Array.from(fileBrowserModal!.selectedFiles).forEach(filePath => {
                        downloadFile(filePath)
                      })
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Download Selected"
                  disabled={fileBrowserModal.selectedFiles.size === 0}
                >
                  ⬇
                </button>
                <div className="w-px h-4 bg-gray-600"></div>
                <button
                  onClick={() => {
                    const fileName = prompt('Enter file name:')
                    if (fileName) {
                      createFile(fileName)
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Create File"
                >
                  📄+
                </button>
                <button
                  onClick={() => {
                    if (fileBrowserModal!.selectedFiles.size > 0) {
                      copyFiles(Array.from(fileBrowserModal!.selectedFiles))
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Copy Selected"
                  disabled={fileBrowserModal.selectedFiles.size === 0}
                >
                  📋
                </button>
                <button
                  onClick={() => {
                    if (fileBrowserModal!.selectedFiles.size > 0) {
                      cutFiles(Array.from(fileBrowserModal!.selectedFiles))
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Cut Selected"
                  disabled={fileBrowserModal.selectedFiles.size === 0}
                >
                  ✂
                </button>
                <button
                  onClick={() => {
                    if (fileBrowserModal!.clipboard) {
                      pasteFiles()
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Paste"
                  disabled={!fileBrowserModal.clipboard}
                >
                  📄
                </button>
                <button
                  onClick={() => {
                    if (fileBrowserModal!.selectedFiles.size > 0) {
                      const zipName = prompt('Enter zip file name:', 'selected_files.zip')
                      if (zipName) {
                        zipFiles(Array.from(fileBrowserModal!.selectedFiles), zipName)
                      }
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Zip Selected"
                  disabled={fileBrowserModal.selectedFiles.size === 0}
                >
                  📦
                </button>
                <button
                  onClick={() => {
                    if (fileBrowserModal!.selectedFiles.size > 0) {
                      if (confirm(`Delete ${fileBrowserModal!.selectedFiles.size} selected items?`)) {
                        deleteFiles(Array.from(fileBrowserModal!.selectedFiles))
                      }
                    }
                  }}
                  className="text-gray-400 hover:text-red-400 p-1"
                  title="Delete Selected"
                  disabled={fileBrowserModal.selectedFiles.size === 0}
                >
                  🗑
                </button>
                <div className="w-px h-4 bg-gray-600"></div>
                <button
                  onClick={() => {
                    const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                    if (wserver && isConnected(fileBrowserModal!.serverId)) {
                      sendToServer(fileBrowserModal!.serverId, {
                        command: 'pm2-list-files',
                        id: fileBrowserModal!.process.pm_id,
                        relativePath: fileBrowserModal!.currentPath,
                        uuid: wserver.uuid,
                        token: wserver.token
                      });
                    }
                  }}
                  className="text-gray-400 hover:text-white p-1"
                  title="Refresh"
                >
                  🔄
                </button>
                <button
                  onClick={() => setFileBrowserModal(null)}
                  className="text-gray-400 hover:text-white p-1"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>


            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {fileBrowserModal.sidebarVisible && (
                <>
                  {/* Sidebar - File Explorer */}
                  <div className="bg-gray-800 border-r border-gray-700 flex flex-col min-h-0" style={{ width: fileBrowserModal.sidebarWidth }}>
                    <div className="p-3 border-b border-gray-700">
                      <h3 className="text-white font-medium text-sm">EXPLORER</h3>
                    </div>
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#4B5563 #1F2937',
                      WebkitScrollbarWidth: 'thin',
                      WebkitScrollbarTrack: 'background: #1F2937',
                      WebkitScrollbarThumb: 'background: #4B5563'
                    } as any}>
                      <div className="p-2">
                        {/* Breadcrumb */}
                        <div
                          className="mb-2 text-xs text-gray-400 cursor-pointer hover:bg-gray-700 p-1 rounded"
                          onContextMenu={(e) => {
                            e.preventDefault()
                            setFileBrowserModal(prev => prev ? {
                              ...prev,
                              contextMenu: { x: e.clientX, y: e.clientY, file: null },
                              selectedFiles: new Set()
                            } : null)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              e.dataTransfer.dropEffect = 'copy'
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const files = Array.from(e.dataTransfer.files)
                            files.forEach(file => uploadFile(file))
                          }}
                        >
                          {fileBrowserModal.currentPath ? (
                            <div className="flex items-center">
                              <button
                                onClick={() => {
                                  const newPath = fileBrowserModal!.currentPath.split('/').slice(0, -1).join('/') || ''
                                  setFileBrowserModal(prev => prev ? { ...prev, currentPath: newPath } : null)
                                  const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                  if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                    sendToServer(fileBrowserModal!.serverId, {
                                      command: 'pm2-list-files',
                                      id: fileBrowserModal!.process.pm_id,
                                      relativePath: newPath,
                                      uuid: wserver.uuid,
                                      token: wserver.token
                                    });
                                  }
                                }}
                                className="text-blue-400 hover:text-blue-300 mr-2 px-2 py-1 rounded hover:bg-gray-700 flex items-center"
                                title="Go back"
                              >
                              ← ..
                            </button>
                              <span>/</span>
                              {fileBrowserModal.currentPath.split('/').map((part, index) => (
                                <span key={index}>
                                  {index > 0 && '/'}
                                  <span className="text-gray-300">{part}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span>Root</span>
                          )}
                        </div>

                        {/* Files List */}
                        <div
                          className="flex-1 space-y-1 select-none bg-gray-800"
                          onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                              // Click on empty space - clear selection
                              setFileBrowserModal(prev => prev ? { ...prev, selectedFiles: new Set() } : null)
                            }
                          }}
                          onContextMenu={(e) => {
                            // Right-click on empty space
                            if (e.target === e.currentTarget) {
                              e.preventDefault()
                              setFileBrowserModal(prev => prev ? {
                                ...prev,
                                contextMenu: { x: e.clientX, y: e.clientY, file: null },
                                selectedFiles: new Set()
                              } : null)
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              e.dataTransfer.dropEffect = 'copy'
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const files = Array.from(e.dataTransfer.files)
                            files.forEach(file => uploadFile(file))
                          }}
                        >
                          {fileBrowserModal.isTreeView ? renderTree(fileBrowserModal.treeData) : fileBrowserModal.files.map((file: any, index: number) => {
                            const filePath = fileBrowserModal.currentPath ? `${fileBrowserModal.currentPath}/${file.name}` : file.name
                            const isSelected = fileBrowserModal.selectedFiles.has(filePath)
                            const isRenaming = fileBrowserModal.renamingFile === filePath

                            return (
                              <div
                                key={index}
                                draggable={!isRenaming}
                                onMouseDown={(e) => {
                                  if (isRenaming) return
                                  e.preventDefault()
                                  const newSelected = new Set(fileBrowserModal!.selectedFiles)

                                  if (e.ctrlKey || e.metaKey) {
                                    // Ctrl+click: toggle selection
                                    if (isSelected) {
                                      newSelected.delete(filePath)
                                    } else {
                                      newSelected.add(filePath)
                                    }
                                  } else if (e.shiftKey && fileBrowserModal!.selectionStart !== null) {
                                    // Shift+click: range selection
                                    const startIndex = fileBrowserModal!.selectionStart
                                    const endIndex = index
                                    const minIndex = Math.min(startIndex, endIndex)
                                    const maxIndex = Math.max(startIndex, endIndex)

                                    for (let i = minIndex; i <= maxIndex; i++) {
                                      const f = fileBrowserModal!.files[i]
                                      const p = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${f.name}` : f.name
                                      newSelected.add(p)
                                    }
                                  } else {
                                    // Single click: start new selection
                                    newSelected.clear()
                                    newSelected.add(filePath)
                                    setFileBrowserModal(prev => prev ? { ...prev, selectionStart: index } : null)
                                  }

                                  setFileBrowserModal(prev => prev ? { ...prev, selectedFiles: newSelected, isSelecting: true } : null)
                                }}
                                onMouseEnter={(e) => {
                                  if (fileBrowserModal!.isSelecting && e.buttons === 1) {
                                    // Drag selection
                                    const newSelected = new Set(fileBrowserModal!.selectedFiles)
                                    const startIndex = fileBrowserModal!.selectionStart!
                                    const endIndex = index
                                    const minIndex = Math.min(startIndex, endIndex)
                                    const maxIndex = Math.max(startIndex, endIndex)

                                    newSelected.clear()
                                    for (let i = minIndex; i <= maxIndex; i++) {
                                      const f = fileBrowserModal!.files[i]
                                      const p = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${f.name}` : f.name
                                      newSelected.add(p)
                                    }

                                    setFileBrowserModal(prev => prev ? { ...prev, selectedFiles: newSelected } : null)
                                  }
                                }}
                                onMouseUp={() => {
                                  setFileBrowserModal(prev => prev ? { ...prev, isSelecting: false } : null)
                                }}
                                onDragStart={(e) => {
                                  if (isRenaming) return
                                  e.dataTransfer.setData('text/plain', filePath)
                                  e.dataTransfer.effectAllowed = 'move'
                                }}
                                onDragOver={(e) => {
                                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                    e.preventDefault()
                                    e.dataTransfer.dropEffect = 'copy'
                                  } else if (file.isDirectory && !isRenaming) {
                                    e.preventDefault()
                                    e.dataTransfer.dropEffect = 'move'
                                  }
                                }}
                                onDrop={(e) => {
                                   e.preventDefault()
                                   e.stopPropagation()
                                   if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                     const files = Array.from(e.dataTransfer.files)
                                     const targetPath = file.isDirectory ? filePath : (filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '')
                                     files.forEach(f => uploadFile(f, targetPath))
                                     return
                                   }
                                   if (file.isDirectory && !isRenaming) {
                                     const draggedPath = e.dataTransfer.getData('text/plain')
                                     if (draggedPath && draggedPath !== filePath) {
                                       const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                       if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                         sendToServer(fileBrowserModal!.serverId, {
                                           command: 'pm2-move-file',
                                           id: fileBrowserModal!.process.pm_id,
                                           sourcePath: draggedPath,
                                           destinationPath: filePath,
                                           uuid: wserver.uuid,
                                           token: wserver.token
                                         })
                                         // Refresh file list
                                         setTimeout(() => {
                                           sendToServer(fileBrowserModal!.serverId, {
                                             command: 'pm2-list-files',
                                             id: fileBrowserModal!.process.pm_id,
                                             relativePath: fileBrowserModal!.currentPath,
                                             uuid: wserver.uuid,
                                             token: wserver.token
                                           })
                                         }, 500)
                                       }
                                     }
                                   }
                                 }}
                                onDoubleClick={() => {
                                  if (isRenaming) return

                                  if (file.isDirectory) {
                                    const newPath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${file.name}` : file.name
                                    setFileBrowserModal(prev => prev ? { ...prev, currentPath: newPath } : null)
                                    const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                    if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                      sendToServer(fileBrowserModal!.serverId, {
                                        command: 'pm2-list-files',
                                        id: fileBrowserModal!.process.pm_id,
                                        relativePath: newPath,
                                        uuid: wserver.uuid,
                                        token: wserver.token
                                      });
                                    }
                                  } else {
                                    setFileBrowserModal(prev => {
                                      if (!prev) return null
                                      const existingIndex = prev.openFiles.findIndex(f => f.path === filePath)
                                      if (existingIndex >= 0) {
                                        return { ...prev, activeTabIndex: existingIndex }
                                      } else {
                                        const newOpenFiles = [...prev.openFiles, { file, content: '', path: filePath, originalContent: '', modified: false }]
                                        return { ...prev, openFiles: newOpenFiles, activeTabIndex: newOpenFiles.length - 1 }
                                      }
                                    })
                                    const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                    if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                      sendToServer(fileBrowserModal!.serverId, {
                                        command: 'pm2-read-file',
                                        id: fileBrowserModal!.process.pm_id,
                                        relativePath: filePath,
                                        uuid: wserver.uuid,
                                        token: wserver.token
                                      });
                                    }
                                  }
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault()
                                  if (isRenaming) return
                                  setFileBrowserModal(prev => prev ? { ...prev, contextMenu: { x: e.clientX, y: e.clientY, file } } : null)
                                }}
                                className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 text-sm min-h-[2rem] ${
                                  isSelected ? 'bg-blue-600 text-white' : ''
                                } ${file.isDirectory ? 'text-blue-400' : 'text-gray-300'}`}
                              >
                                <span className="mr-2">{file.isDirectory ? '📁' : '📄'}</span>
                                {isRenaming ? (
                                  <input
                                    type="text"
                                    defaultValue={file.name}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const newName = (e.target as HTMLInputElement).value.trim()
                                        if (newName && newName !== file.name) {
                                          renameFile(filePath, newName)
                                        }
                                        setFileBrowserModal(prev => prev ? { ...prev, renamingFile: null } : null)
                                      } else if (e.key === 'Escape') {
                                        setFileBrowserModal(prev => prev ? { ...prev, renamingFile: null } : null)
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const newName = e.target.value.trim()
                                      if (newName && newName !== file.name) {
                                        renameFile(filePath, newName)
                                      }
                                      setFileBrowserModal(prev => prev ? { ...prev, renamingFile: null } : null)
                                    }}
                                    className="flex-1 bg-gray-600 text-white border-none outline-none px-1"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span className="truncate">{file.name}</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resizer */}
                  <div
                    className="w-1 bg-gray-700 cursor-col-resize hover:bg-gray-600"
                    onMouseDown={(e) => {
                      setIsResizing(true)
                      setStartX(e.clientX)
                      setStartWidth(fileBrowserModal!.sidebarWidth)
                    }}
                  />
                </>
              )}

              {/* Editor Area */}
              <div className="flex-1 flex flex-col bg-gray-900"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    e.dataTransfer.dropEffect = 'copy'
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const files = Array.from(e.dataTransfer.files)
                  files.forEach(file => uploadFile(file))
                }}
              >
                {fileBrowserModal.openFiles.length > 0 ? (
                  <>
                    {/* File Tabs */}
                    <div className="bg-gray-800 border-b border-gray-700 flex">
                      {fileBrowserModal.openFiles.map((openFile, index) => (
                        <div
                          key={index}
                          className={`flex items-center px-3 py-2 border-r border-gray-700 cursor-pointer hover:bg-gray-700 ${
                            index === fileBrowserModal.activeTabIndex ? 'bg-gray-700' : ''
                          }`}
                          onClick={() => setFileBrowserModal(prev => prev ? { ...prev, activeTabIndex: index } : null)}
                        >
                          <span className="text-gray-300 text-sm mr-2">{openFile.file.name}</span>
                          <div className="flex items-center ml-1">
                            {openFile.modified && <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setFileBrowserModal(prev => {
                                  if (!prev) return null
                                  const newOpenFiles = prev.openFiles.filter((_, i) => i !== index)
                                  let newActiveIndex = prev.activeTabIndex
                                  if (index === prev.activeTabIndex) {
                                    newActiveIndex = Math.max(0, index - 1)
                                  } else if (index < prev.activeTabIndex) {
                                    newActiveIndex = prev.activeTabIndex - 1
                                  }
                                  if (newOpenFiles.length === 0) newActiveIndex = -1
                                  return { ...prev, openFiles: newOpenFiles, activeTabIndex: newActiveIndex }
                                })
                              }}
                              className="text-gray-500 hover:text-gray-300"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Editor Toolbar */}
                    {!isImageFile(fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name) && (
                      <div className="bg-gray-800 border-b border-gray-700 px-4 py-0.5 flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            if (textarea) {
                              document.execCommand('undo')
                            }
                          }}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Undo (Ctrl+Z)"
                        >
                          ↶
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            if (textarea) {
                              document.execCommand('redo')
                            }
                          }}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Redo (Ctrl+Y)"
                        >
                          ↷
                        </button>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            if (textarea) {
                              document.execCommand('cut')
                            }
                          }}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Cut (Ctrl+X)"
                        >
                          ✂
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            if (textarea) {
                              document.execCommand('copy')
                            }
                          }}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Copy (Ctrl+C)"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            if (textarea) {
                              document.execCommand('paste')
                            }
                          }}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Paste (Ctrl+V)"
                        >
                          📄
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            if (textarea) {
                              textarea.select()
                            }
                          }}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Select All (Ctrl+A)"
                        >
                          ☑
                        </button>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <button
                          onClick={() => setFileBrowserModal(prev => prev ? { ...prev, wordWrap: !prev.wordWrap } : null)}
                          className={`px-2 py-1 text-sm rounded ${fileBrowserModal.wordWrap ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                          title="Toggle Word Wrap"
                        >
                          ⤶
                        </button>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <button
                          onClick={() => setFileBrowserModal(prev => prev ? { ...prev, sidebarVisible: !prev.sidebarVisible } : null)}
                          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                          title="Toggle Sidebar"
                        >
                          📂
                        </button>
                      </div>
                    )}

                    {/* Editor */}
                    {fileBrowserModal.activeTabIndex >= 0 && (
                      <>
                        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#4B5563 #1F2937',
                          WebkitScrollbarWidth: 'thin',
                          WebkitScrollbarTrack: 'background: #1F2937',
                          WebkitScrollbarThumb: 'background: #4B5563'
                        } as any}>
                          {isImageFile(fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name) ? (
                            <div className="flex items-center justify-center h-full p-4">
                              <img
                                src={fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].content.startsWith('data:') ? fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].content : `data:image/${getMimeType(fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name)};base64,${fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].content}`}
                                className="max-w-full max-h-full object-contain"
                                alt={fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name}
                              />
                            </div>
                          ) : (
                            <div className="flex">
                              {/* Line Numbers */}
                              <div className="bg-gray-800 border-r border-gray-700 px-1 py-1 text-gray-500 text-sm font-mono select-none flex-shrink-0">
                                {fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].content.split('\n').map((_, index) => (
                                  <div key={index} className="leading-6 h-6">
                                    {index + 1}
                                  </div>
                                ))}
                              </div>
                              {/* Textarea */}
                              <textarea
                                value={fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].content}
                                onChange={(e) => setFileBrowserModal(prev => {
                                  if (!prev || prev.activeTabIndex < 0) return prev
                                  const newOpenFiles = [...prev.openFiles]
                                  newOpenFiles[prev.activeTabIndex].content = e.target.value
                                  newOpenFiles[prev.activeTabIndex].modified = e.target.value !== newOpenFiles[prev.activeTabIndex].originalContent
                                  return { ...prev, openFiles: newOpenFiles }
                                })}
                                className="flex-1 bg-gray-800 text-gray-100 border-0 p-1 font-mono text-sm resize-none focus:outline-none"
                                placeholder="Loading file content..."
                                spellCheck={false}
                                style={{ lineHeight: '1.5rem', whiteSpace: fileBrowserModal.wordWrap ? 'pre-wrap' : 'pre' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Footer with Save Button */}
                        <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex justify-between items-center flex-shrink-0">
                          <div className="text-gray-400 text-xs">
                            {isImageFile(fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name)
                              ? `Image file • ${fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name}`
                              : `${fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].content.length} characters • ${fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name}`
                            }
                          </div>
                          <div className="flex gap-2">
                            <button
                              disabled={isImageFile(fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name)}
                              onClick={() => {
                                const activeFile = fileBrowserModal!.openFiles[fileBrowserModal!.activeTabIndex]
                                const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                                if (wserver && isConnected(fileBrowserModal!.serverId)) {
                                  const isImage = isImageFile(activeFile.file.name)
                                  const contentToSend = isImage ? activeFile.content : btoa(activeFile.content)
                                  sendToServer(fileBrowserModal!.serverId, {
                                    command: 'pm2-write-file',
                                    id: fileBrowserModal!.process.pm_id,
                                    relativePath: activeFile.path,
                                    content: contentToSend,
                                    uuid: wserver.uuid,
                                    token: wserver.token
                                  });
                                  // Show notification immediately
                                  setSaveToast('File saved successfully')
                                  setTimeout(() => setSaveToast(null), 3000)
                                  // Update local state
                                  setFileBrowserModal(prev => {
                                    if (!prev || prev.activeTabIndex < 0) return prev
                                    const newOpenFiles = [...prev.openFiles]
                                    newOpenFiles[prev.activeTabIndex].originalContent = newOpenFiles[prev.activeTabIndex].content
                                    newOpenFiles[prev.activeTabIndex].modified = false
                                    return { ...prev, openFiles: newOpenFiles }
                                  })
                                }
                              }}
                              className={`px-4 py-1 text-sm rounded ${isImageFile(fileBrowserModal.openFiles[fileBrowserModal.activeTabIndex].file.name) ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-4">📄</div>
                      <div>Select a file from the explorer to view its contents</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {fileBrowserModal?.contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 min-w-[160px]"
          style={{
            left: Math.min(fileBrowserModal.contextMenu.x, window.innerWidth - 180),
            top: Math.min(fileBrowserModal.contextMenu.y, window.innerHeight - 200)
          }}
        >
          {fileBrowserModal.contextMenu.file ? (
            // Context menu for files/folders
            <>
              <button
                onClick={() => {
                  const fileName = prompt('Enter file name:')
                  if (fileName) {
                    createFile(fileName)
                  }
                  setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                New File
              </button>
              <button
                onClick={() => {
                  const folderName = prompt('Enter folder name:')
                  if (folderName) {
                    createFolder(folderName)
                  }
                  setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                New Folder
              </button>
              <button
                onClick={() => {
                  const targetPath = fileBrowserModal!.contextMenu!.file.isDirectory ? fileBrowserModal!.contextMenu!.file.path : fileBrowserModal!.contextMenu!.file.path.split('/').slice(0, -1).join('/') || ''
                  setFileBrowserModal(prev => prev ? { ...prev, uploadTargetPath: targetPath, contextMenu: null } : null)
                  uploadInputRef.current?.click()
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Upload File
              </button>
              <div className="border-t border-gray-600 my-1"></div>
              {fileBrowserModal.contextMenu.file.isDirectory ? (
                // Context menu for folders
                <>
                  <button
                    onClick={() => {
                      const folderPath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                      // Navigate into the folder and show context menu for creating inside it
                      setFileBrowserModal(prev => prev ? { ...prev, currentPath: folderPath, contextMenu: null } : null)
                      const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                      if (wserver && isConnected(fileBrowserModal!.serverId)) {
                        sendToServer(fileBrowserModal!.serverId, {
                          command: 'pm2-list-files',
                          id: fileBrowserModal!.process.pm_id,
                          relativePath: folderPath,
                          uuid: wserver.uuid,
                          token: wserver.token
                        });
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Open
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={() => {
                      const fileName = prompt('Enter file name:')
                      if (fileName) {
                        const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}/${fileName}` : `${fileBrowserModal!.contextMenu!.file.name}/${fileName}`
                        const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                        if (wserver && isConnected(fileBrowserModal!.serverId)) {
                          const token = fileBrowserModal!.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
                          sendToServer(fileBrowserModal!.serverId, {
                            command: 'pm2-create-file',
                            id: fileBrowserModal!.process.pm_id,
                            relativePath: filePath,
                            content: '',
                            uuid: wserver.uuid,
                            token: token
                          })
                          // Refresh file list
                          setTimeout(() => {
                            sendToServer(fileBrowserModal!.serverId, {
                              command: 'pm2-list-files',
                              id: fileBrowserModal!.process.pm_id,
                              relativePath: fileBrowserModal!.currentPath,
                              uuid: wserver.uuid,
                              token: wserver.token
                            })
                          }, 500)
                        }
                      }
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    New File
                  </button>
                  <button
                    onClick={() => {
                      const folderName = prompt('Enter folder name:')
                      if (folderName) {
                        const folderPath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}/${folderName}` : `${fileBrowserModal!.contextMenu!.file.name}/${folderName}`
                        const wserver = wservers.find(s => s.id === fileBrowserModal!.serverId)
                        if (wserver && isConnected(fileBrowserModal!.serverId)) {
                          const token = fileBrowserModal!.serverId === 'local' ? localStorage.getItem('accessToken') : wserver.token
                          sendToServer(fileBrowserModal!.serverId, {
                            command: 'pm2-create-folder',
                            id: fileBrowserModal!.process.pm_id,
                            relativePath: folderPath,
                            uuid: wserver.uuid,
                            token: token
                          })
                          // Refresh file list
                          setTimeout(() => {
                            sendToServer(fileBrowserModal!.serverId, {
                              command: 'pm2-list-files',
                              id: fileBrowserModal!.process.pm_id,
                              relativePath: fileBrowserModal!.currentPath,
                              uuid: wserver.uuid,
                              token: wserver.token
                            })
                          }, 500)
                        }
                      }
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    New Folder
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={() => {
                      const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null, renamingFile: filePath } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null, renamingFile: filePath } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                      const zipName = prompt('Enter zip file name:', `${fileBrowserModal!.contextMenu!.file.name}.zip`)
                      if (zipName) {
                        zipFiles([filePath], zipName)
                      }
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Zip Folder
                  </button>
                  <button
                    onClick={() => {
                      const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                      if (confirm(`Delete folder ${fileBrowserModal!.contextMenu!.file.name} and all its contents?`)) {
                        deleteFiles([filePath])
                      }
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </>
              ) : (
                // Context menu for files
                <>
                  <button
                    onClick={() => {
                      const fileName = prompt('Enter file name:')
                      if (fileName) {
                        createFile(fileName)
                      }
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    New File
                  </button>
                  <button
                    onClick={() => {
                      const folderName = prompt('Enter folder name:')
                      if (folderName) {
                        createFolder(folderName)
                      }
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    New Folder
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={() => {
                      const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                      copyFiles([filePath])
                      setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Copy
                  </button>
                 <button
                   onClick={() => {
                     const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                     cutFiles([filePath])
                     setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                   }}
                   className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                 >
                   Cut
                 </button>
                 <button
                   onClick={() => {
                     const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                     setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null, renamingFile: filePath } : null)
                   }}
                   className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                 >
                   Rename
                 </button>
                 <button
                   onClick={() => {
                     const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                     if (confirm(`Delete ${fileBrowserModal!.contextMenu!.file.name}?`)) {
                       deleteFiles([filePath])
                     }
                     setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                   }}
                   className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                 >
                   Delete
                 </button>
                 <button
                   onClick={() => {
                     const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                     const zipName = prompt('Enter zip file name:', `${fileBrowserModal!.contextMenu!.file.name}.zip`)
                     if (zipName) {
                       zipFiles([filePath], zipName)
                     }
                     setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                   }}
                   className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                 >
                   Zip
                 </button>
                 {fileBrowserModal.contextMenu.file.name.endsWith('.zip') && (
                   <button
                     onClick={() => {
                       const filePath = fileBrowserModal!.currentPath ? `${fileBrowserModal!.currentPath}/${fileBrowserModal!.contextMenu!.file.name}` : fileBrowserModal!.contextMenu!.file.name
                       unzipFile(filePath)
                       setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                     }}
                     className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                   >
                     Unzip
                   </button>
                 )}
               </>
             )}
            </>
          ) : (
            // Context menu for empty space
            <>
              <button
                onClick={() => {
                  const fileName = prompt('Enter file name:')
                  if (fileName) {
                    createFile(fileName)
                  }
                  setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                New File
              </button>
              <button
                onClick={() => {
                  const folderName = prompt('Enter folder name:')
                  if (folderName) {
                    createFolder(folderName)
                  }
                  setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                New Folder
              </button>
              <button
                onClick={() => {
                  setFileBrowserModal(prev => prev ? { ...prev, uploadTargetPath: '', contextMenu: null } : null)
                  uploadInputRef.current?.click()
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Upload File
              </button>
              {fileBrowserModal.clipboard && (
                <button
                  onClick={() => {
                    pasteFiles()
                    setFileBrowserModal(prev => prev ? { ...prev, contextMenu: null } : null)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Paste
                </button>
              )}
            </>
          )}
        </div>
      )}

      {saveToast && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg text-center"
          style={{ zIndex: 10000 }}
        >
          {saveToast}
        </div>
      )}
    </div>
  )
}
