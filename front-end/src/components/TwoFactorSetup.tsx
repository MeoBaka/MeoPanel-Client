'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmDialog from './ConfirmDialog'

export default function TwoFactorSetup() {
  const [twoFactorStatus, setTwoFactorStatus] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  const {
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    regenerateBackupCodes,
    getTwoFactorStatus
  } = useAuth()

  useEffect(() => {
    loadTwoFactorStatus()
  }, [])

  const loadTwoFactorStatus = async () => {
    try {
      const status = await getTwoFactorStatus()
      setTwoFactorStatus(status)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSetup = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await setupTwoFactor()
      setQrCode(result.qrCode)
      setSuccess('QR code generated. Scan with your authenticator app.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await verifyTwoFactor(verificationCode)
      setBackupCodes(result.backupCodes)
      setShowBackupCodes(true)
      setQrCode('')
      setVerificationCode('')
      await loadTwoFactorStatus()
      setSuccess('Two-factor authentication enabled successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = () => {
    setShowDisableConfirm(true)
  }

  const confirmDisable = async () => {
    setShowDisableConfirm(false)
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await disableTwoFactor()
      setTwoFactorStatus({ isEnabled: false, isSetup: false })
      setQrCode('')
      setBackupCodes([])
      setShowBackupCodes(false)
      setSuccess('Two-factor authentication disabled successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelDisable = () => {
    setShowDisableConfirm(false)
  }

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await regenerateBackupCodes()
      setBackupCodes(result.backupCodes)
      setShowBackupCodes(true)
      setSuccess('Backup codes regenerated successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!twoFactorStatus) {
    return <div className="text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">
            Two-Factor Authentication
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Status</h4>
                <p className="text-sm text-gray-400">
                  {twoFactorStatus.isEnabled ? 'Enabled' : 'Disabled'}
                  {twoFactorStatus.isSetup && !twoFactorStatus.isEnabled && ' (Setup in progress)'}
                </p>
              </div>
              <div className="flex space-x-2">
                {!twoFactorStatus.isEnabled && (
                  <button
                    onClick={handleSetup}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Setting up...' : 'Setup 2FA'}
                  </button>
                )}
                {twoFactorStatus.isEnabled && (
                  <>
                    <button
                      onClick={handleRegenerateBackupCodes}
                      disabled={isLoading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? 'Regenerating...' : 'New Backup Codes'}
                    </button>
                    <button
                      onClick={handleDisable}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {qrCode && (
              <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                <h4 className="text-sm font-medium text-white mb-2">
                  Scan QR Code
                </h4>
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="QR Code" className="max-w-xs" />
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                      Enter verification code
                    </label>
                    <input
                      id="code"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg transition-colors"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                  </button>
                </form>
              </div>
            )}

            {showBackupCodes && backupCodes.length > 0 && (
              <div className="border border-yellow-600 rounded-lg p-4 bg-yellow-900 bg-opacity-20">
                <h4 className="text-sm font-medium text-yellow-200 mb-2">
                  ⚠️ Save Your Backup Codes
                </h4>
                <p className="text-sm text-yellow-300 mb-4">
                  These codes can be used to access your account if you lose your authenticator device.
                  Save them in a secure place.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded border border-gray-600 text-center font-mono text-sm text-white">
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowBackupCodes(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  I've Saved These Codes
                </button>
              </div>
            )}

            {twoFactorStatus.isEnabled && (
              <div className="border border-green-600 rounded-lg p-4 bg-green-900 bg-opacity-20">
                <h4 className="text-sm font-medium text-green-200 mb-2">
                  ✅ Two-Factor Authentication is Enabled
                </h4>
                <p className="text-sm text-green-300">
                  Your account is now protected with two-factor authentication.
                  You have {twoFactorStatus.backupCodesCount} backup codes remaining.
                </p>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-900 bg-opacity-20 border border-red-600 p-3 rounded">{error}</div>
            )}

            {success && (
              <div className="text-green-400 text-sm bg-green-900 bg-opacity-20 border border-green-600 p-3 rounded">{success}</div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDisableConfirm}
        title="Disable Two-Factor Authentication"
        message="Are you sure you want to disable two-factor authentication? This will make your account less secure."
        confirmText="Disable 2FA"
        cancelText="Cancel"
        onConfirm={confirmDisable}
        onCancel={cancelDisable}
      />
    </div>
  )
}