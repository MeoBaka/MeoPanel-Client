'use client'

import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react'

interface WServer {
  id: string
  servername: string
  url: string
  uuid: string
  token: string
  createdAt: string
  updatedAt: string
}

interface WebSocketContextType {
  connectToServer: (wserver: WServer, onMessage: (event: MessageEvent, serverId: string) => void, onOpen?: (ws: WebSocket, wserver: WServer) => void) => void
  sendToServer: (serverId: string, message: any) => void
  disconnectFromServer: (serverId: string) => void
  isConnected: (serverId: string) => boolean
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
  user: any
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, user }) => {
  const wsRefs = useRef<Record<string, WebSocket>>({})
  const messageHandlers = useRef<Record<string, (event: MessageEvent, serverId: string) => void>>({})

  const connectToServer = useCallback((wserver: WServer, onMessage: (event: MessageEvent, serverId: string) => void, onOpen?: (ws: WebSocket, wserver: WServer) => void) => {
    // Don't create a new connection if one is already active
    if (wsRefs.current[wserver.id] && wsRefs.current[wserver.id].readyState === WebSocket.OPEN) {
      // Update message handler
      messageHandlers.current[wserver.id] = onMessage
      return
    }

    // Close existing connection if it's in a bad state
    if (wsRefs.current[wserver.id] && wsRefs.current[wserver.id].readyState !== WebSocket.CLOSED) {
      wsRefs.current[wserver.id].close()
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = wserver.url.replace(/^http/, 'ws')
    console.log('Attempting WebSocket connection to:', wsUrl)

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      // Send authentication message
      const clientName = user ? `${process.env.NEXT_PUBLIC_PAGENAME || 'MeoPanel'}_${user.username}` : 'unknown'
      const authMessage = {
        uuid: wserver.uuid,
        token: wserver.token,
        clientName
      }
      ws.send(JSON.stringify(authMessage))
      // Call onOpen callback if provided
      if (onOpen) {
        onOpen(ws, wserver)
      }
    }

    ws.onmessage = (event) => {
      const handler = messageHandlers.current[wserver.id]
      if (handler) {
        handler(event, wserver.id)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error for server', wserver.servername, 'URL:', wsUrl, 'Error:', error)
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed for server', wserver.servername, 'code:', event.code)
      // Automatic reconnection after 5 seconds
      setTimeout(() => {
        connectToServer(wserver, onMessage)
      }, 5000)
    }

    wsRefs.current[wserver.id] = ws
    messageHandlers.current[wserver.id] = onMessage
  }, [user])

  const sendToServer = useCallback((serverId: string, message: any) => {
    const ws = wsRefs.current[serverId]
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }, [])

  const disconnectFromServer = useCallback((serverId: string) => {
    const ws = wsRefs.current[serverId]
    if (ws) {
      ws.close()
      delete wsRefs.current[serverId]
      delete messageHandlers.current[serverId]
    }
  }, [])

  const isConnected = useCallback((serverId: string) => {
    const ws = wsRefs.current[serverId]
    return ws && ws.readyState === WebSocket.OPEN
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(wsRefs.current).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      })
      wsRefs.current = {}
      messageHandlers.current = {}
    }
  }, [])

  const value: WebSocketContextType = {
    connectToServer,
    sendToServer,
    disconnectFromServer,
    isConnected
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}