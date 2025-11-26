

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UsersTab from "./UsersTab";
import toast, { Toaster } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'overview' | 'users' | 'products' | 'orders' | 'analytics' | 'sellerApplications';


interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellerApplications: Array<{
    id: string;
    businessName: string;
    businessType: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }>;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  adminApprovalRequired: boolean;
  cancellationReason?: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  orderItems: OrderItem[];
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary-green/20 to-banana-leaf/20 flex items-center justify-center text-3xl sm:text-4xl shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary-green mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // load overview on mount
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'sellerApplications') fetchOverview(); // stats includes pending apps
    // other tabs load on demand if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // small loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-green"></div>
      </div>
    );
  }

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  // Approve/reject seller application
  async function handleApplication(appId: string, status: 'approved' | 'rejected') {
    try {
      const res = await fetch(`/api/admin/seller-applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('application patch failed', res.status, text);
        throw new Error('Failed to update application');
      }
      toast.success(`Application ${status}`);
      fetchOverview();
    } catch (err) {
      console.error(err);
      toast.error('Error updating application');
    }
  }

  // Cancel order (admin-initiated)
  async function handleCancelOrder() {
    if (!selectedOrder) return;
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancellationReason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err?.error || 'Failed to cancel');
      }
      toast.success('Order cancelled');
      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancellationReason('');
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order');
    }
  }

  // Approve or reject cancellation requested by user
  async function handleApproveCancellation(orderId: string, approved: boolean) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-cancellation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err?.error || 'Failed to update');
      }
      toast.success(approved ? 'Cancellation approved' : 'Cancellation rejected');
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to process cancellation');
    }
  }

  function toggleExpand(orderId: string) {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  }

  function openCancelModal(order: Order) {
    setSelectedOrder(order);
    setCancellationReason('');
    setShowCancelModal(true);
  }

  function openConfirmModal(order: Order) {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  }

  // utility to show status color
  function statusClasses(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 text-gray-900">
      <Toaster position="top-right" />

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Bars3Icon className="h-6 w-6 text-primary-green" />
              </button>

              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-green to-banana-leaf rounded-xl shadow-md flex items-center justify-center overflow-hidden">
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-green">Admin Dashboard</h1>
                  <p className="text-xs text-gray-600 hidden md:block">Manage users, products and orders</p>
                </div>
                <h1 className="sm:hidden text-lg font-bold text-primary-green">Admin</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="hidden sm:flex text-sm text-primary-green hover:underline items-center gap-2 transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden md:inline">Back to site</span>
              </Link>
              <Link href="/" className="sm:hidden p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-5 w-5 text-primary-green" />
              </Link>
              <div className="rounded-full bg-gradient-to-br from-primary-green to-banana-leaf p-2 shadow-md text-white text-lg">
                👤
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar - Mobile Overlay / Desktop Fixed */}
          <aside className={`
            fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] lg:h-auto
            w-64 lg:w-72 bg-white lg:bg-white/80 lg:backdrop-blur
            rounded-none lg:rounded-2xl shadow-xl lg:shadow border-r lg:border border-gray-200 lg:border-white/30
            transition-transform duration-300 ease-in-out z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:flex-shrink-0
          `}>
            <div className="p-4 h-full overflow-y-auto">
              {/* Mobile close button */}
              <div className="lg:hidden flex justify-between items-center mb-4 pb-3 border-b">
                <h2 className="font-semibold text-primary-green">Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {([
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'users', label: 'Users', icon: '👥' },
                  { id: 'products', label: 'Products', icon: '📦' },
                  { id: 'orders', label: 'Orders', icon: '📋' },
                  { id: 'analytics', label: 'Analytics', icon: '📈' },
                  { id: 'sellerApplications', label: 'Seller Apps', icon: '📝' },
                ] as { id: TabId; label: string; icon: string }[]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id);
                      setSidebarOpen(false); // Close mobile menu on selection
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                      activeTab === t.id
                        ? 'bg-gradient-to-r from-primary-green to-banana-leaf text-white shadow-md transform scale-[1.02]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="font-medium flex-1">{t.label}</span>
                    {activeTab === t.id && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium"
                >
                  🚨 Manage Orders
                </button>
                <Link
                  href="/admin/settings"
                  className="block text-center text-sm text-gray-600 hover:text-primary-green py-2 transition-colors"
                >
                  ⚙️ Admin Settings
                </Link>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <section className="flex-1 min-w-0">
            {/* OVERVIEW */}
            {activeTab === 'overview' && stats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
                  <StatCard label="Total Products" value={stats.totalProducts} icon="📦" />
                  <StatCard label="Total Orders" value={stats.totalOrders} icon="📋" />
                  <StatCard label="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} icon="💰" />
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary-green flex items-center gap-2">
                      <span>📝</span>
                      <span>Recent Seller Applications</span>
                    </h3>
                    {stats.pendingSellerApplications.length > 0 && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {stats.pendingSellerApplications.length} pending
                      </span>
                    )}
                  </div>
                  {stats.pendingSellerApplications.length ? (
                    <div className="space-y-3">
                      {stats.pendingSellerApplications.map((app) => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl border border-gray-100 gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{app.businessName}</p>
                            <p className="text-sm text-gray-600 mt-1">{app.businessType} • {app.user.name || app.user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2 sm:flex-shrink-0">
                            <button
                              onClick={() => handleApplication(app.id, 'approved')}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleApplication(app.id, 'rejected')}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-sm text-gray-500">No pending applications</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-primary-green flex items-center gap-2">
                      <span>📋</span>
                      <span>Order Management</span>
                    </h3>
                    <button
                      onClick={() => fetchOrders()}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-primary-green transition-all font-medium text-sm"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">📦</div>
                      <p className="text-gray-500">No orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-gradient-to-r from-gray-50 to-green-50/20 rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-primary-green/50 transition-all">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-bold text-primary-green text-lg">#{order.id.slice(-8)}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses(order.status)}`}>
                                    {order.status.toUpperCase()}
                                  </span>
                                  {order.adminApprovalRequired && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                      ⚠️ APPROVAL REQUIRED
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  <span className="font-medium">{order.user.name || order.user.email}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(order.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm font-semibold text-primary-green mt-2">
                                  Total: ₱{order.totalAmount.toFixed(2)}
                                </p>
                              </div>

                              <button
                                onClick={() => toggleExpand(order.id)}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-primary-green hover:text-white transition-all flex-shrink-0"
                                aria-expanded={!!expandedOrders[order.id]}
                                title={expandedOrders[order.id] ? "Collapse" : "Expand"}
                              >
                                {expandedOrders[order.id] ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              {order.adminApprovalRequired ? (
                                <>
                                  <button
                                    onClick={() => handleApproveCancellation(order.id, true)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm"
                                  >
                                    ✓ Approve Cancel
                                  </button>
                                  <button
                                    onClick={() => handleApproveCancellation(order.id, false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors text-sm"
                                  >
                                    ✕ Reject Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => openCancelModal(order)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors text-sm"
                                  >
                                    🗑️ Cancel Order
                                  </button>
                                  <button
                                    onClick={() => openConfirmModal(order)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-200 font-medium hover:bg-primary-green hover:text-white hover:border-primary-green transition-all text-sm"
                                  >
                                    ✓ Mark Processed
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedOrders[order.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <span>📍</span>
                                      <span>Order Details</span>
                                    </h5>
                                    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shipping Address</p>
                                        <p className="text-sm text-gray-900 font-medium">{order.shippingAddress}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billing Address</p>
                                        <p className="text-sm text-gray-900 font-medium">{order.billingAddress}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Method</p>
                                        <p className="text-sm text-gray-900 font-medium">{order.paymentMethod}</p>
                                      </div>
                                      <div className="pt-3 border-t">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                                        <p className="text-lg font-bold text-primary-green">₱{order.totalAmount.toFixed(2)}</p>
                                      </div>
                                      {order.cancellationReason && (
                                        <div className="pt-3 border-t border-red-200">
                                          <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Cancellation Reason</p>
                                          <p className="text-sm text-red-700 font-medium">{order.cancellationReason}</p>
                                        </div>
                                      )}
                                      {order.cancelledAt && (
                                        <div>
                                          <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Cancelled At</p>
                                          <p className="text-sm text-red-700 font-medium">{new Date(order.cancelledAt).toLocaleString()}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <span>📦</span>
                                      <span>Order Items</span>
                                    </h5>
                                    <div className="space-y-2">
                                      {order.orderItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-primary-green/50 transition-colors">
                                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-green-50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {item.product.image ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="text-xl font-bold text-primary-green">{item.product.name.slice(0,1)}</div>
                                            )}
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                              Qty: <span className="font-medium">{item.quantity}</span> × ₱{item.price.toFixed(2)}
                                            </p>
                                            <p className="text-sm font-semibold text-primary-green mt-1">
                                              Subtotal: ₱{(item.quantity * item.price).toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SELLER APPLICATIONS */}
            {activeTab === 'sellerApplications' && stats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-primary-green flex items-center gap-2">
                      <span>📝</span>
                      <span>Seller Applications</span>
                    </h3>
                    {stats.pendingSellerApplications.length > 0 && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {stats.pendingSellerApplications.length}
                      </span>
                    )}
                  </div>
                  {stats.pendingSellerApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">✅</div>
                      <p className="text-gray-500">No pending applications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.pendingSellerApplications.map(app => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-yellow-50/30 rounded-xl border border-gray-100 gap-3 hover:border-primary-green/50 transition-all">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg">{app.businessName}</p>
                            <p className="text-sm text-gray-600 mt-1">{app.businessType}</p>
                            <p className="text-sm text-gray-600">Owner: {app.user.name || app.user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex gap-2 sm:flex-shrink-0">
                            <button
                              onClick={() => handleApplication(app.id, 'approved')}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleApplication(app.id, 'rejected')}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircleIcon className="h-5 w-5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <UsersTab />
            )}

            {activeTab === 'products' && (
              <ProductsManager />
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl sm:text-2xl font-semibold text-primary-green mb-3 flex items-center gap-2">
                    <span>📈</span>
                    <span>Analytics</span>
                  </h3>
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📊</div>
                    <p className="text-sm text-gray-600 mb-2">Analytics dashboard coming soon</p>
                    <p className="text-xs text-gray-500">Add Recharts or Chart.js components here for visualizations</p>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancelModal && selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Cancel Order #{selectedOrder.id.slice(-8)}</h3>
              <p className="text-sm text-gray-600 mb-4">Provide a reason for cancelling this order (this will be recorded).</p>
              <textarea
                rows={4}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg mb-4"
                placeholder="Reason..."
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowCancelModal(false); setSelectedOrder(null); setCancellationReason(''); }} className="px-4 py-2 rounded-lg border">Close</button>
                <button onClick={handleCancelOrder} className="px-4 py-2 rounded-lg bg-red-600 text-white">Confirm Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal (simple example for processing an order) */}
      <AnimatePresence>
        {showConfirmModal && selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Mark order as processed?</h3>
              <p className="text-sm text-gray-600 mb-4">This will change the order status to processing.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowConfirmModal(false); setSelectedOrder(null); }} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button
                  onClick={async () => {
                    if (!selectedOrder) return;
                    try {
                      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/mark-processing`, { method: 'PATCH' });
                      if (!res.ok) throw new Error('Failed');
                      toast.success('Order marked processing');
                      setShowConfirmModal(false);
                      setSelectedOrder(null);
                      fetchOrders();
                    } catch (err) {
                      console.error(err);
                      toast.error('Failed to update order');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-primary-green text-white"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


/* ---------------- Helper components ---------------- */

function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards'); // default to cards for mobile

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [refreshKey]);

  async function updateProductStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/${status}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update product status');
      toast.success(`Product ${status}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product status');
    }
  }

  async function toggleFeatured(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/feature`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to toggle featured');
      toast.success('Toggled featured state');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle featured');
    }
  }

  async function updateCategory(id: string, category: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/category`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update category');
      toast.success('Category updated');
      setEditingCategoryId(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update category');
    }
  }

  async function removeProduct(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/remove`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove product');
      toast.success('Product removed');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove product');
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-primary-green flex items-center gap-2">
            <span>📦</span>
            <span>Products Management</span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-r from-primary-green to-banana-leaf text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-primary-green to-banana-leaf text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-green mx-auto mb-3"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-500">No products found</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(prod => (
              <div key={prod.id} className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl border border-gray-200 overflow-hidden hover:border-primary-green/50 transition-all">
                <div className="relative h-48 bg-gray-100">
                  {prod.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      📦
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      prod.status === 'approved' ? 'bg-green-500 text-white' :
                      prod.status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {prod.status.toUpperCase()}
                    </span>
                    {prod.featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-gray-900 truncate">{prod.name}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-primary-green">₱{prod.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-semibold">{prod.stock}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    {editingCategoryId === prod.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <button
                          onClick={() => updateCategory(prod.id, categoryInput)}
                          className="bg-primary-green text-white rounded px-2 text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="bg-gray-300 rounded px-2 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingCategoryId(prod.id);
                          setCategoryInput(prod.category || '');
                        }}
                        className="cursor-pointer hover:underline font-medium text-primary-green"
                      >
                        {prod.category || 'N/A'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Featured:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prod.featured || false}
                        onChange={() => toggleFeatured(prod.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    {prod.status !== 'approved' && (
                      <>
                        <button
                          onClick={() => updateProductStatus(prod.id, 'approve')}
                          className="flex-1 bg-primary-green text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => updateProductStatus(prod.id, 'reject')}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => removeProduct(prod.id)}
                    className="w-full bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="py-3 px-4 border-b text-center text-xs font-semibold text-gray-600 uppercase">Featured</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-b">
                      {prod.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover rounded-lg" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400">
                          📦
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-b font-medium text-gray-900">{prod.name}</td>
                    <td className="p-3 border-b">
                      {editingCategoryId === prod.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-24"
                          />
                          <button
                            onClick={() => updateCategory(prod.id, categoryInput)}
                            className="bg-primary-green text-white rounded px-2 text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="bg-gray-300 rounded px-2 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => {
                            setEditingCategoryId(prod.id);
                            setCategoryInput(prod.category || '');
                          }}
                          className="cursor-pointer hover:underline text-primary-green"
                        >
                          {prod.category || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-b font-semibold text-primary-green">₱{prod.price.toFixed(2)}</td>
                    <td className="p-3 border-b">{prod.stock}</td>
                    <td className="p-3 border-b">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        prod.status === 'approved' ? 'bg-green-100 text-green-800' :
                        prod.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <input
                        type="checkbox"
                        checked={prod.featured || false}
                        onChange={() => toggleFeatured(prod.id)}
                        className="w-4 h-4 text-primary-green rounded focus:ring-primary-green"
                      />
                    </td>
                    <td className="p-3 border-b">
                      <div className="flex gap-2">
                        {prod.status !== 'approved' && (
                          <>
                            <button
                              onClick={() => updateProductStatus(prod.id, 'approve')}
                              className="bg-primary-green text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateProductStatus(prod.id, 'reject')}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeProduct(prod.id)}
                          className="bg-gray-400 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
