'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  username: string
  email: string
  emailVerifiedAt?: string
  created_at: string
  updated_at: string
}

interface Session {
  id: string
  userAgent: string
  ipAddress: string
  createdAt: string
  lastUsedAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, twoFactorCode?: string) => Promise<any>
  register: (data: { username: string; email: string; password: string }) => Promise<any>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  getSessions: () => Promise<Session[]>
  logoutSession: (sessionId: string) => Promise<any>
  forgotPassword: (email: string) => Promise<any>
  resetPassword: (token: string, newPassword: string) => Promise<any>
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>
  verifyEmail: (token: string) => Promise<any>
  resendVerification: (email: string) => Promise<any>
  setupTwoFactor: () => Promise<any>
  verifyTwoFactor: (token: string) => Promise<any>
  disableTwoFactor: () => Promise<any>
  regenerateBackupCodes: () => Promise<any>
  getTwoFactorStatus: () => Promise<any>
  isLoading: boolean
  requiresTwoFactor: boolean
  twoFactorUserId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const response = await fetch('http://localhost:5000/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Token expired, try refresh
          await refreshToken()
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return

      const response = await fetch('http://localhost:5000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // Get user profile
        const profileResponse = await fetch('http://localhost:5000/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (profileResponse.ok) {
          const userData = await profileResponse.json()
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernameOrEmail: email,
        password,
        twoFactorCode,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    if (data.requiresTwoFactor) {
      // Store login credentials temporarily for 2FA verification
      localStorage.setItem('tempLogin', JSON.stringify({ email, password }))
      setRequiresTwoFactor(true)
      setTwoFactorUserId(data.userId)
      return data
    }

    // Successful login
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    setRequiresTwoFactor(false)
    setTwoFactorUserId(null)

    return data
  }

  const register = async (data: { username: string; email: string; password: string; name?: string }) => {
    const response = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed')
    }

    return result
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await fetch('http://localhost:5000/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setRequiresTwoFactor(false)
      setTwoFactorUserId(null)
    }
  }

  const logoutAll = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('http://localhost:5000/auth/logout-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setRequiresTwoFactor(false)
      setTwoFactorUserId(null)
    }
  }

  const getSessions = async (): Promise<Session[]> => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/sessions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Get sessions failed')
    }

    return data
  }

  const logoutSession = async (sessionId: string) => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/logout-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Logout session failed')
    }

    return data
  }

  const forgotPassword = async (email: string) => {
    const response = await fetch('http://localhost:5000/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Forgot password failed')
    }

    return data
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const response = await fetch('http://localhost:5000/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Reset password failed')
    }

    return data
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Change password failed')
    }

    return data
  }

  const verifyEmail = async (token: string) => {
    const response = await fetch('http://localhost:5000/email-verification/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Email verification failed')
    }

    return data
  }

  const resendVerification = async (email: string) => {
    const response = await fetch('http://localhost:5000/email-verification/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Resend verification failed')
    }

    return data
  }

  const setupTwoFactor = async () => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/2fa/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Setup 2FA failed')
    }

    return data
  }

  const verifyTwoFactor = async (token: string) => {
    const authToken = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/2fa/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Verify 2FA failed')
    }

    return data
  }

  const disableTwoFactor = async () => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/2fa/disable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Disable 2FA failed')
    }

    return data
  }

  const regenerateBackupCodes = async () => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/2fa/regenerate-backup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Regenerate backup codes failed')
    }

    return data
  }

  const getTwoFactorStatus = async () => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/auth/2fa/status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Get 2FA status failed')
    }

    return data
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    logoutAll,
    getSessions,
    logoutSession,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    resendVerification,
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    regenerateBackupCodes,
    getTwoFactorStatus,
    isLoading,
    requiresTwoFactor,
    twoFactorUserId,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}