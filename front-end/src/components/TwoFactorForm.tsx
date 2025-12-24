'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TwoFactorForm() {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, twoFactorUserId, cancelTwoFactor } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // We need to get the original login credentials from somewhere
      // For now, we'll assume they are stored temporarily
      const tempCredentials = JSON.parse(localStorage.getItem('tempLogin') || '{}')

      if (!tempCredentials.email || !tempCredentials.password) {
        throw new Error('Login session expired. Please login again.')
      }

      await login(tempCredentials.email, tempCredentials.password, token)
      localStorage.removeItem('tempLogin') // Clean up
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter the 6-digit code from your authenticator app or an 8-character backup code
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 border border-gray-700 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300">
                Authentication Code
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase().slice(0, 8))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000/ABC12345"
                maxLength={8}
              />
              <p className="mt-2 text-sm text-gray-500">
                Or enter a backup code if you don't have access to your authenticator
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || (token.length !== 6 && token.length !== 8)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={cancelTwoFactor}
              className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}