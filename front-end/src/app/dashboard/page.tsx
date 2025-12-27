'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
// import WServerTab from '@/components/WServerTab'
// import PM2Tab from '@/components/PM2Tab'
// import InstanceTab from '@/components/InstanceTab'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('wserver')
  const router = useRouter()

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                MeoPanel Client
              </button>
            </div>
            <nav className="flex space-x-4 relative">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {user.name || user.username} ▼
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        router.push('/dashboard')
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('wserver')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'wserver'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  WServer
                </button>
                <button
                  onClick={() => setActiveTab('pm2')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pm2'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  PM2
                </button>
                <button
                  onClick={() => setActiveTab('instance')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instance'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Instance
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'wserver' && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-white mb-4">WServer Management</h3>
                <p className="text-gray-400">WServer management interface will be implemented here.</p>
              </div>
            )}
            {activeTab === 'pm2' && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-white mb-4">PM2 Management</h3>
                <p className="text-gray-400">PM2 management features coming soon...</p>
              </div>
            )}
            {activeTab === 'instance' && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-white mb-4">Instance Management</h3>
                <p className="text-gray-400">Instance management features coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 MeoPanel Client. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}