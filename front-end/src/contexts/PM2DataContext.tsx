import React, { createContext, useContext, useState, ReactNode } from 'react'

interface PM2Process {
  name: string
  pid: number
  pm_id: number
  monit: {
    memory: number
    cpu: number
  }
  pm2_env: {
    status: string
    restart_time: number
    pm_uptime: number
    pm_cwd: string
  }
  note?: string
}

interface PM2DataContextType {
  pm2Data: Record<string, PM2Process[]>
  updatePM2Data: (serverId: string, processes: PM2Process[]) => void
}

const PM2DataContext = createContext<PM2DataContextType | undefined>(undefined)

export const usePM2Data = () => {
  const context = useContext(PM2DataContext)
  if (!context) {
    throw new Error('usePM2Data must be used within a PM2DataProvider')
  }
  return context
}

interface PM2DataProviderProps {
  children: ReactNode
}

export const PM2DataProvider: React.FC<PM2DataProviderProps> = ({ children }) => {
  const [pm2Data, setPm2Data] = useState<Record<string, PM2Process[]>>({})

  const updatePM2Data = (serverId: string, processes: PM2Process[]) => {
    setPm2Data(prev => ({
      ...prev,
      [serverId]: processes
    }))
  }

  return (
    <PM2DataContext.Provider value={{ pm2Data, updatePM2Data }}>
      {children}
    </PM2DataContext.Provider>
  )
}