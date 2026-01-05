export interface AuditLog {
  id: string
  userId: string | null
  user?: {
    id: string
    name: string
    username: string
    email: string
  }
  action: string
  resource: string
  details: string
  ipAddress: string | null
  userAgent: string | null
  sessionId: string | null
  metadata: any
  isSuccess: number
  createdAt: string
}

export interface AdminLogTabProps {
  activeTab: string
}

export interface Filters {
  username: string
  resource: string
  startDate: string
  endDate: string
}

export interface FetchAuditLogsResponse {
  logs: AuditLog[]
  total: number
  totalPages: number
}