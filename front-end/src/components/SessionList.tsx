'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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

  const handleLogoutSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to logout this session?')) return

    try {
      await logoutSession(sessionId)
      // Reload sessions after logout
      await loadSessions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to logout session')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }


  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={loadSessions}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Active Sessions</h3>
          <button
            onClick={loadSessions}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No active sessions found.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        IP: {session.ipAddress}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <div className="font-medium">User Agent:</div>
                      <div className="break-all bg-gray-50 p-2 rounded text-xs font-mono">
                        {session.userAgent}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Created: {formatDate(session.createdAt)}</div>
                      {session.lastUsedAt && (
                        <div>Last used: {formatDate(session.lastUsedAt)}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}