'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  blocked: boolean
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // userId for action running

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockToggle = async (userId: string, currentBlocked: boolean) => {
    const confirmed = window.confirm(`Are you sure you want to ${currentBlocked ? 'unblock' : 'block'} this user?`)
    if (!confirmed) return
    try {
      setActionLoading(userId)
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !currentBlocked }),
      })
      if (!res.ok) throw new Error('Failed to update block status')
      await fetchUsers()
      toast.success(`User ${currentBlocked ? 'unblocked' : 'blocked'} successfully`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update block status'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleConvertRole = async (userId: string, currentRole: string) => {
    const confirmed = window.confirm(`Are you sure you want to convert this user to ${currentRole === 'user' ? 'Seller' : 'User'}?`)
    if (!confirmed) return
    try {
      setActionLoading(userId)
      const res = await fetch(`/api/admin/users/${userId}/convert`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to convert user role')
      await fetchUsers()
      toast.success('User role converted successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert user role'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetCredentials = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to reset credentials for this user?')
    if (!confirmed) return
    try {
      setActionLoading(userId)
      const res = await fetch(`/api/admin/users/${userId}/reset-credentials`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to reset credentials')
      toast.success('Reset token generated successfully. Check email or admin dashboard.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset credentials'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <p>Loading users...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-primary-green">User Management</h3>
      <table className="min-w-full text-left text-sm font-light">
        <thead className="border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Blocked</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2">{user.name || '-'}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2 capitalize">{user.role}</td>
              <td className="px-4 py-2">{user.blocked ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  disabled={actionLoading === user.id}
                  onClick={() => handleBlockToggle(user.id, user.blocked)}
                  className="btn-hover bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                >
                  {user.blocked ? 'Unblock' : 'Block'}
                </button>
                <button
                  disabled={actionLoading === user.id}
                  onClick={() => handleConvertRole(user.id, user.role)}
                  className="btn-hover bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                >
                  Convert to {user.role === 'user' ? 'Seller' : 'User'}
                </button>
                <button
                  disabled={actionLoading === user.id}
                  onClick={() => handleResetCredentials(user.id)}
                  className="btn-hover bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                >
                  Reset Credentials
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
