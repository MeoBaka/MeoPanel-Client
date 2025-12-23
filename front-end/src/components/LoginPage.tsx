'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import TwoFactorForm from './TwoFactorForm'

type TabType = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<TabType>('login')
  const { requiresTwoFactor } = useAuth()

  if (requiresTwoFactor) {
    return <TwoFactorForm />
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          MeoPanel Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Complete authentication system with 2FA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 border border-gray-700 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'login'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'register'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab('forgot')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'forgot'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {activeTab === 'login' && <LoginForm />}
          {activeTab === 'register' && <RegisterForm />}
          {activeTab === 'forgot' && <ForgotPasswordForm />}
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email or Username
        </label>
        <input
          id="email"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email or username"
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}