'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface WServer {
  id: string
  servername: string
  url: string
  uuid: string
  token: string
  createdAt: string
  updatedAt: string
}

export default function WServerTab() {
  const { user } = useAuth()
  const [wservers, setWservers] = useState<WServer[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    servername: '',
    url: '',
    uuid: '',
    token: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWservers()
  }, [])

  const fetchWservers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/wservers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWservers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch wservers:', error)
    }
  }

  const handleAddWserver = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/wservers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setShowAddModal(false)
        setFormData({ servername: '', url: '', uuid: '', token: '' })
        fetchWservers()
      } else {
        console.error('Failed to add wserver')
      }
    } catch (error) {
      console.error('Error adding wserver:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/wservers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchWservers()
      } else {
        console.error('Failed to delete wserver')
      }
    } catch (error) {
      console.error('Error deleting wserver:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">WServer Management</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add WServer
        </button>
      </div>

      <div className="grid gap-4">
        {wservers.map((wserver) => (
          <div key={wserver.id} className="bg-gray-800 p-4 rounded-md flex justify-between items-center">
            <div>
              <h4 className="text-white font-medium">{wserver.servername}</h4>
              <p className="text-gray-400 text-sm">{wserver.url}</p>
              <p className="text-gray-400 text-sm">UUID: server-uuid</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => console.log('Edit', wserver.id)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(wserver.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {wservers.length === 0 && (
          <p className="text-gray-400 text-center py-8">No wservers found. Click "Add WServer" to add your first server.</p>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-md w-full max-w-md">
            <h4 className="text-white text-lg font-medium mb-4">Add New WServer</h4>
            <form onSubmit={handleAddWserver}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Server Name</label>
                <input
                  type="text"
                  value={formData.servername}
                  onChange={(e) => setFormData({ ...formData, servername: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">UUID</label>
                <input
                  type="text"
                  value={formData.uuid}
                  onChange={(e) => setFormData({ ...formData, uuid: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Token</label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add WServer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}