'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { changePassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword)
      setSuccess('Password changed successfully. You will be logged out from other devices.')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-white mb-4">
          Change Password
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-400 text-sm">{success}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}