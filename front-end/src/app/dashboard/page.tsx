'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import WServerTab from '@/components/WServerTab'
import PM2Tab from '@/components/PM2Tab'
import InstanceTab from '@/components/InstanceTab'
import UserManagerTab from '@/components/UserManagerTab'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
   const { user, logout, isLoading } = useAuth()
   const [activeTab, setActiveTab] = useState(() => {
     if (typeof window !== 'undefined') {
       return localStorage.getItem('activeTab') || 'pm2'
     }
     return 'pm2'
   })
   const router = useRouter()

   useEffect(() => {
     if (typeof window !== 'undefined' && !isLoading && !user) {
       router.push('/')
     }
   }, [user, isLoading, router])

   useEffect(() => {
     if (user) {
       const hasWServerAccess = user.role === 'ADMIN' || user.role === 'OWNER'
       if (!hasWServerAccess && (activeTab === 'wserver' || activeTab === 'usermanager')) {
         setActiveTab('pm2')
       }
     }
   }, [user, activeTab])

   const handleTabChange = (tab: string) => {
     setActiveTab(tab)
     localStorage.setItem('activeTab', tab)
   }

   if (isLoading) {
     return (
       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
       </div>
     )
   }

   if (!user) {
     return null
   }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header user={user} logout={logout} />

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {user && (user.role === 'ADMIN' || user.role === 'OWNER') && (
                  <button
                    onClick={() => handleTabChange('wserver')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'wserver'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    WServer
                  </button>
                )}
                <button
                  onClick={() => handleTabChange('pm2')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pm2'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  PM2
                </button>
                <button
                  onClick={() => handleTabChange('instance')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instance'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Instance
                </button>
                {user && (user.role === 'ADMIN' || user.role === 'OWNER') && (
                  <button
                    onClick={() => handleTabChange('usermanager')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'usermanager'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    User Manager
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {user && (user.role === 'ADMIN' || user.role === 'OWNER') && (
              <div className={activeTab === 'wserver' ? '' : 'hidden'}>
                <WServerTab activeTab={activeTab} />
              </div>
            )}
            <div className={activeTab === 'pm2' ? '' : 'hidden'}>
              <PM2Tab activeTab={activeTab} />
            </div>
            <div className={activeTab === 'instance' ? '' : 'hidden'}>
              <InstanceTab activeTab={activeTab} />
            </div>
            {user && (user.role === 'ADMIN' || user.role === 'OWNER') && (
              <div className={activeTab === 'usermanager' ? '' : 'hidden'}>
                <UserManagerTab activeTab={activeTab} />
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