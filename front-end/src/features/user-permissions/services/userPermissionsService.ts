import { User, WServer, PM2Permission, PM2Process } from '../types'

const API_BASE_URL = `http://${process.env.NEXT_PUBLIC_SERVICE_HOST}:${process.env.NEXT_PUBLIC_SERVICE_PORT}`

export const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    const data = await response.json()
    return data.data
  }
  throw new Error('Failed to fetch users')
}

export const fetchWservers = async (): Promise<WServer[]> => {
  // Always include local server for permissions management
  const localServer = {
    id: 'local',
    servername: 'Local Server',
    url: `ws://${process.env.NEXT_PUBLIC_SERVICE_HOST}:${process.env.NEXT_PUBLIC_SERVICE_PORT}`,
    uuid: 'local-server',
    token: 'local-token',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  try {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${API_BASE_URL}/wservers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      const responseData = await response.json()
      const remoteServers = responseData.data || []
      return [localServer, ...remoteServers]
    } else {
      // If not authorized or other error, still provide local server
      return [localServer]
    }
  } catch (error) {
    console.error('Failed to fetch wservers:', error)
    // If fetching fails, still provide local server
    return [localServer]
  }
}

export const fetchPermissions = async (): Promise<PM2Permission[]> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/pm2-permissions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    return await response.json()
  }
  throw new Error('Failed to fetch permissions')
}

export const fetchMyPermissions = async (userId: string): Promise<PM2Permission[]> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/pm2-permissions/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    return await response.json()
  }
  throw new Error('Failed to fetch my permissions')
}


export const fetchCurrentPermissions = async (
  userId: string,
  serverId: string
): Promise<PM2Permission[]> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/pm2-permissions/user/${userId}/server/${serverId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    return await response.json()
  }
  throw new Error('Failed to fetch current permissions')
}

export const savePermissions = async (
  userId: string,
  serverId: string,
  processName: string,
  permissions: string[]
): Promise<void> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/pm2-permissions/upsert`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      wserverId: serverId,
      pm2ProcessName: processName,
      permissions
    })
  })
  if (!response.ok) {
    throw new Error('Failed to save permissions')
  }
}

export const deletePermission = async (permissionId: string): Promise<void> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/pm2-permissions/${permissionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!response.ok) {
    throw new Error('Failed to delete permission')
  }
}