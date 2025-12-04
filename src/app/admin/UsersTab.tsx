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
 <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
 <div className="h-7 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
 <div className="space-y-4">
 {[1, 2, 3, 4, 5].map((i) => (
 <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
 <div className="flex items-center justify-between">
 <div className="flex-1 space-y-3">
 <div className="h-5 bg-gray-200 rounded w-48"></div>
 <div className="h-4 bg-gray-200 rounded w-64"></div>
 <div className="flex gap-2">
 <div className="h-5 bg-gray-200 rounded-full w-16"></div>
 <div className="h-5 bg-gray-200 rounded-full w-20"></div>
 </div>
 </div>
 <div className="flex gap-2">
 <div className="h-8 w-20 bg-gray-200 rounded"></div>
 <div className="h-8 w-20 bg-gray-200 rounded"></div>
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
 className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-soft-green/30"
 >
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2 bg-gradient-to-br from-primary-green/20 to-banana-leaf/20 rounded-xl">
 <UserGroupIcon className="w-6 h-6 text-primary-green" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-primary-green">User Management</h3>
 <p className="text-sm text-gray-500">{users.length} users total</p>
 </div>
 </div>

 {/* Mobile Card View */}
 <div className="block lg:hidden space-y-4">
 {users.map((user, index) => (
 <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
 >
 {/* User Info */}
 <div className="mb-4">
 <div className="flex items-start justify-between mb-2">
 <div className="flex-1 min-w-0">
 <h4 className="font-semibold text-gray-900 text-base truncate">
 {user.name || 'No Name'}
 </h4>
 <p className="text-sm text-gray-600 truncate">{user.email}</p>
 </div>
 </div>

 {/* Role and Status Badges */}
 <div className="flex flex-wrap gap-2 mt-3">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
 user.role === 'seller'
 ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
 : user.role === 'admin'
 ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800'
 : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
 }`}>
 {user.role === 'seller' && <BuildingStorefrontIcon className="w-3.5 h-3.5" />}
 {user.role === 'user' && <ShoppingBagIcon className="w-3.5 h-3.5" />}
 <span className="capitalize">{user.role}</span>
 </span>
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
 user.blocked
 ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
 : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
 }`}>
 {user.blocked ? (
 <span className="flex items-center gap-1.5">
 <LockClosedIcon className="w-3.5 h-3.5" />
 Blocked
 </span>
 ) : (
 <span className="flex items-center gap-1.5">
 <LockOpenIcon className="w-3.5 h-3.5" />
 Active
 </span>
 )}
 </span>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
 <button
 disabled={actionLoading === user.id}
 onClick={() => handleBlockToggle(user.id, user.blocked)}
 className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
 user.blocked
 ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
 : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
 }`}
 >
 {user.blocked ? (
 <span className="flex items-center gap-2">
 <LockOpenIcon className="w-5 h-5" />
 Unblock User
 </span>
 ) : (
 <span className="flex items-center gap-2">
 <LockClosedIcon className="w-5 h-5" />
 Block User
 </span>
 )}
 </button>
 <div className="grid grid-cols-2 gap-2">
 <button
 disabled={actionLoading === user.id}
 onClick={() => handleConvertRole(user.id, user.role)}
 className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <ArrowPathIcon className="w-4 h-4" />
 To {user.role === 'user' ? 'Seller' : 'User'}
 </button>
 <button
 disabled={actionLoading === user.id}
 onClick={() => handleResetCredentials(user.id)}
 className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <KeyIcon className="w-4 h-4" />
 Reset
 </button>
 </div>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Desktop Table View */}
 <div className="hidden lg:block overflow-x-auto">
 <table className="min-w-full text-left text-sm">
 <thead className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-green-50/30">
 <tr>
 <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
 </tr>
 </thead>
 <tbody>
 {users.map((user) => (
 <tr key={user.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-soft-green/10 hover:to-banana-leaf/10 transition-all"
 >
 <td className="px-4 py-3 font-medium text-gray-900">{user.name || '-'}</td>
 <td className="px-4 py-3 text-gray-600">{user.email}</td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
 user.role === 'seller'
 ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
 : user.role === 'admin'
 ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800'
 : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
 }`}>
 {user.role === 'seller' && <BuildingStorefrontIcon className="w-3.5 h-3.5" />}
 {user.role === 'user' && <ShoppingBagIcon className="w-3.5 h-3.5" />}
 <span className="capitalize">{user.role}</span>
 </span>
 </td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
 user.blocked
 ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
 : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
 }`}>
 {user.blocked ? (
 <span className="flex items-center gap-1.5">
 <LockClosedIcon className="w-3.5 h-3.5" />
 Blocked
 </span>
 ) : (
 <span className="flex items-center gap-1.5">
 <LockOpenIcon className="w-3.5 h-3.5" />
 Active
 </span>
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
 <span className="flex items-center gap-1.5">
 <LockOpenIcon className="w-4 h-4" />
 Unblock
 </span>
 ) : (
 <span className="flex items-center gap-1.5">
 <LockClosedIcon className="w-4 h-4" />
 Block
 </span>
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
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </motion.div>
 )
}
