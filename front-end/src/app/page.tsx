'use client'

import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <LandingPage user={user} />
}