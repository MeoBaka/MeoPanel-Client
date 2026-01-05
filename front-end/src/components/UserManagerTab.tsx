'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
  status: number
  created_at: string
  updated_at: string
}

interface UserManagerTabProps {
  activeTab: string
}

export default function UserManagerTab({ activeTab }: UserManagerTabProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', role: '', status: 0 })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVICE_HOST}:${process.env.NEXT_PUBLIC_SERVICE_PORT}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const canEditUser = (targetUser: User) => {
    if (!user) return false
    if (user.id === targetUser.id) return false // cannot edit self
    if (user.role === 'OWNER') return true
    if (user.role === 'ADMIN' && targetUser.role === 'MEMBER') return true
    return false
  }

  const canEditRole = (targetUser: User) => {
    if (!user) return false
    if (user.id === targetUser.id) return false
    if (user.role === 'OWNER') return true
    if (user.role === 'ADMIN' && targetUser.role === 'MEMBER') return true
    return false
  }

  const startEdit = (targetUser: User) => {
    if (!canEditUser(targetUser)) return
    setEditingUser(targetUser.id)
    setEditForm({
      name: targetUser.name || '',
      role: targetUser.role,
      status: targetUser.status,
    })
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditForm({ name: '', role: '', status: 0 })
  }

  const saveEdit = async (targetUser: User) => {
    try {
      const token = localStorage.getItem('accessToken')

      // Update name
      const updateResponse = await fetch(`http://${process.env.NEXT_PUBLIC_SERVICE_HOST}:${process.env.NEXT_PUBLIC_SERVICE_PORT}/users/${targetUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
        }),
      })

      // Update role if changed and allowed
      if (canEditRole(targetUser) && editForm.role !== targetUser.role) {
        await fetch(`http://${process.env.NEXT_PUBLIC_SERVICE_HOST}:${process.env.NEXT_PUBLIC_SERVICE_PORT}/users/${targetUser.id}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: editForm.role }),
        })
      }

      // Update status if changed
      if (editForm.status !== targetUser.status) {
        await fetch(`http://${process.env.NEXT_PUBLIC_SERVICE_HOST}:${process.env.NEXT_PUBLIC_SERVICE_PORT}/users/${targetUser.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: editForm.status }),
        })
      }

      if (updateResponse.ok) {
        fetchUsers() // Refresh list
        cancelEdit()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">User Manager</h3>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {editingUser === u.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                    />
                  ) : (
                    u.name || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {editingUser === u.id && canEditRole(u) ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      {user?.role === 'OWNER' && <option value="OWNER">Owner</option>}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {editingUser === u.id ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: parseInt(e.target.value) })}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      <option value={-1}>Banned</option>
                      <option value={0}>Inactive</option>
                      <option value={1}>Active</option>
                    </select>
                  ) : (
                    u.status === -1 ? 'Banned' : u.status === 0 ? 'Inactive' : 'Active'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingUser === u.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => saveEdit(u)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    canEditUser(u) && (
                      <button
                        onClick={() => startEdit(u)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
