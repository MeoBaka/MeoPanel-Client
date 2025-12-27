'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import TwoFactorSetup from '@/components/TwoFactorSetup'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import SessionList from '@/components/SessionList'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

type TabType = 'profile' | 'security' | '2fa'

export default function Settings() {
  const { user, logout, logoutAll } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted && !user) {
      router.push('/')
    }
  }, [user, router, isMounted])

  if (!isMounted || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={user} logout={logout} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('2fa')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === '2fa'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                Two-Factor Auth
              </button>
            </nav>
          </div>

          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === '2fa' && <TwoFactorSetup />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab() {
  const { user, resendVerification } = useAuth()
  const [resendMessage, setResendMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResending(true)
    setResendMessage('')

    try {
      await resendVerification(user.email)
      setResendMessage('Verification email sent. Please check your console for the link.')
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-white mb-4">User Profile</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-400">Full Name</dt>
            <dd className="mt-1 text-sm text-white">{user.name || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-400">Username</dt>
            <dd className="mt-1 text-sm text-white">{user.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-white flex items-center gap-2">
              {user.email}
              {!user.emailVerifiedAt && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  {isResending ? 'Sending...' : 'Resend Verification'}
                </button>
              )}
            </dd>
            {resendMessage && (
              <p className="mt-1 text-xs text-blue-400">{resendMessage}</p>
            )}
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-400">Email Verified</dt>
            <dd className="mt-1 text-sm text-white">
              {user.emailVerifiedAt ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-200">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-800 text-yellow-200">
                  Unverified
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-400">Role</dt>
            <dd className="mt-1 text-sm text-white">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-800 text-blue-200 capitalize">
                {user.role}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-400">Member Since</dt>
            <dd className="mt-1 text-sm text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function SecurityTab() {
  const { logout, logoutAll } = useAuth()

  return (
    <div className="space-y-6">
      <ChangePasswordForm />

      <SessionList />

      <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">Session Management</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white">Current Session</h4>
              <p className="text-sm text-gray-400">Log out from your current session only.</p>
              <button
                onClick={logout}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Logout Current Session
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white">All Sessions</h4>
              <p className="text-sm text-gray-400">Log out from all devices and sessions.</p>
              <button
                onClick={logoutAll}
                className="mt-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Logout All Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}