import { AuditLog, Filters, FetchAuditLogsResponse } from '../types'

const API_BASE_URL = 'http://localhost:5000'

export const fetchAuditLogs = async (
  page: number,
  pageSize: number,
  filters: Filters
): Promise<FetchAuditLogsResponse> => {
  const token = localStorage.getItem('accessToken')
  const params = new URLSearchParams({
    limit: pageSize.toString(),
    offset: ((page - 1) * pageSize).toString(),
  })

  if (filters.username) params.append('username', filters.username)
  if (filters.resource) params.append('resource', filters.resource)
  if (filters.startDate) params.append('startDate', filters.startDate + 'T00:00:00.000Z')
  if (filters.endDate) params.append('endDate', filters.endDate + 'T23:59:59.999Z')

  const response = await fetch(`${API_BASE_URL}/audit/logs?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    return await response.json()
  } else {
    throw new Error('Failed to fetch audit logs')
  }
}