'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  UserGroupIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon,
  KeyIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-64"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-soft-green/30 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-primary-green/20 to-banana-leaf/20 dark:from-primary-green/30 dark:to-banana-leaf/30 rounded-xl">
          <UserGroupIcon className="w-6 h-6 text-primary-green dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary-green dark:text-green-400">User Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} users total</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-green-50/30 dark:from-gray-700 dark:to-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-soft-green/10 hover:to-banana-leaf/10 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{user.name || '-'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'seller'
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300'
                      : user.role === 'admin'
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-300'
                      : 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300'
                  }`}>
                    {user.role === 'seller' && <BuildingStorefrontIcon className="w-3.5 h-3.5" />}
                    {user.role === 'user' && <ShoppingBagIcon className="w-3.5 h-3.5" />}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    user.blocked
                      ? 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-300'
                      : 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300'
                  }`}>
                    {user.blocked ? (
                      <>
                        <LockClosedIcon className="w-3.5 h-3.5" />
                        Blocked
                      </>
                    ) : (
                      <>
                        <LockOpenIcon className="w-3.5 h-3.5" />
                        Active
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading === user.id}
                      onClick={() => handleBlockToggle(user.id, user.blocked)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.blocked
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      }`}
                    >
                      {user.blocked ? (
                        <>
                          <LockOpenIcon className="w-4 h-4" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="w-4 h-4" />
                          Block
                        </>
                      )}
                    </button>
                    <button
                      disabled={actionLoading === user.id}
                      onClick={() => handleConvertRole(user.id, user.role)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      To {user.role === 'user' ? 'Seller' : 'User'}
                    </button>
                    <button
                      disabled={actionLoading === user.id}
                      onClick={() => handleResetCredentials(user.id)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <KeyIcon className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
