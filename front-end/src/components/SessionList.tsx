'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmDialog from './ConfirmDialog'

interface Session {
  id: string
  userAgent: string
  ipAddress: string
  createdAt: string
  lastUsedAt: string
}

export default function SessionList() {
  const { getSessions, logoutSession } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    sessionId: string
    title: string
    message: string
  }>({
    isOpen: false,
    sessionId: '',
    title: '',
    message: '',
  })

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleLogoutSession = (sessionId: string) => {
    setConfirmDialog({
      isOpen: true,
      sessionId,
      title: 'Logout Session',
      message: 'Are you sure you want to logout this session? This action cannot be undone.',
    })
  }

  const confirmLogout = async () => {
    try {
      await logoutSession(confirmDialog.sessionId)
      setConfirmDialog({ isOpen: false, sessionId: '', title: '', message: '' })
      // Reload sessions after logout
      await loadSessions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to logout session')
      setConfirmDialog({ isOpen: false, sessionId: '', title: '', message: '' })
    }
  }

  const cancelLogout = () => {
    setConfirmDialog({ isOpen: false, sessionId: '', title: '', message: '' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }


  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-red-400 text-sm">{error}</div>
          <button
            onClick={loadSessions}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-white">Active Sessions</h3>
          <button
            onClick={loadSessions}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
            title="Refresh sessions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-gray-400 text-sm">No active sessions found.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-white">
                        IP: {session.ipAddress}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 mb-2">
                      <div className="font-medium flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>User Agent:</span>
                      </div>
                      <div className="break-all bg-gray-600 p-2 rounded text-xs font-mono text-gray-200 mt-1">
                        {session.userAgent}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Created: {formatDate(session.createdAt)}</span>
                      </div>
                      {session.lastUsedAt && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Last used: {formatDate(session.lastUsedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    title="Logout this session"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  )
}