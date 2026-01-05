export interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
}

export interface WServer {
  id: string
  servername: string
  url: string
  uuid: string
  token: string
  createdAt: string
  updatedAt: string
}

export interface PM2Permission {
  id: string
  userId: string
  wserverId: string
  pm2ProcessName: string
  permissions: string[]
  user?: User
  wserver?: WServer
}

export interface UserPermissionsTabProps {
  activeTab: string
}

export interface PM2Process {
  name: string
  pm_id: number
}

export interface PermissionOption {
  value: string
  label: string
}

export interface Toast {
  message: string
  type: 'success' | 'error'
}