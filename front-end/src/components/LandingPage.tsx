'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoginPage from './LoginPage'
import Header from './Header'

interface LandingPageProps {
  user: any
}

export default function LandingPage({ user }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  if (showLogin && !user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header user={user} logout={logout} onLogin={() => setShowLogin(true)} />

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Manage Your Console Programs & Games
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              MeoPanel Client is a powerful management tool for console programs, games like Minecraft, and PM2 processes.
            </p>
            <div className="mt-8">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white">Console Program Management</h3>
                <p className="mt-2 text-gray-400">
                  Easily manage and monitor your console-based applications with intuitive controls.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white">Game Server Control</h3>
                <p className="mt-2 text-gray-400">
                  Control and monitor game servers like Minecraft with real-time status and logs.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white">PM2 Process Management</h3>
                <p className="mt-2 text-gray-400">
                  Manage PM2 processes with advanced monitoring and control features.
                </p>
              </div>
            </div>
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