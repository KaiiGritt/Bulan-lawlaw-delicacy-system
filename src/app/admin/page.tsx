'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    orderItems: Array<{ product: { name: string } }>;
  }>;
  pendingProducts: Array<{
    id: string;
    name: string;
    createdAt: string;
    user: { name: string };
  }>;
  pendingSellerApplications: Array<{
    id: string;
    businessName: string;
    businessType: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }>;
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
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch admin statistics');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/seller-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`${status} failed:`, res.status, text);
        throw new Error(`Failed to ${status} application`);
      }

      fetchStats(); // refresh dashboard
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) return;

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancellationReason }),
      });

      if (res.ok) {
        alert('Order cancelled successfully');
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancellationReason('');
        fetchOrders(); // Refresh orders
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel order');
    }
  };

  const handleApproveCancellation = async (orderId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-cancellation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        alert(approved ? 'Cancellation approved' : 'Cancellation rejected');
        fetchOrders(); // Refresh orders
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to process cancellation');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process cancellation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'processing'].includes(order.status);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-xl mb-4">⚠️ {error}</p>
        <button
          onClick={fetchStats}
          className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50">
      {/* Header */}
      <header className="glassmorphism sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
            <Image src="/logo.png" alt="Lawlaw Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold text-primary-green hover:text-leaf-green transition-colors duration-300">
              Admin Dashboard
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">Welcome, Admin</span>
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hover:text-primary-green transition text-xl"
              >👤</button>
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Admin</p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-green transition">My Account</Link>
                      <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-green transition">Logout</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/" className="btn-hover text-primary-green hover:text-leaf-green text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/60">
              ← Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'products', label: 'Products', icon: '📦' },
              { id: 'orders', label: 'Orders', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'sellerApplications', label: 'Seller Applications', icon: '📝' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary-green text-white shadow-md'
                    : 'text-gray-700 hover:bg-white/60 hover:text-primary-green'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon="👥" label="Total Users" value={stats.totalUsers} />
              <StatCard icon="📦" label="Total Products" value={stats.totalProducts} />
              <StatCard icon="📋" label="Total Orders" value={stats.totalOrders} />
              <StatCard icon="💰" label="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Order Management</h3>
            <p className="text-gray-600 mb-6">View and manage all orders, including cancellations.</p>
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-primary-green">
                          Order #{order.id.slice(-8)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          By {order.user.name || order.user.email} • Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.adminApprovalRequired && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveCancellation(order.id, true)}
                              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                              Approve Cancel
                            </button>
                            <button
                              onClick={() => handleApproveCancellation(order.id, false)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Reject Cancel
                            </button>
                          </div>
                        )}
                        {canCancelOrder(order) && !order.adminApprovalRequired && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancelModal(true);
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>

                    {order.cancellationReason && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Cancellation Reason:</strong> {order.cancellationReason}
                        </p>
                        {order.cancelledAt && (
                          <p className="text-sm text-red-600 mt-1">
                            Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ₱{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-sm text-gray-600">
                          Payment: {order.paymentMethod}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ₱{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            )}
          </div>
        )}

        {activeTab === 'sellerApplications' && stats && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Seller Applications</h3>
            <p className="text-gray-600 mb-6">Review and approve/reject seller applications.</p>
            {stats.pendingSellerApplications.length > 0 ? (
              stats.pendingSellerApplications.map(app => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-900">{app.businessName}</p>
                    <p className="text-sm text-gray-600">{app.businessType} by {app.user.name || app.user.email}</p>
                    <p className="text-xs text-gray-500">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApplication(app.id, 'approved')}
                      className="btn-hover bg-primary-green text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-leaf-green transition-colors duration-200"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleApplication(app.id, 'rejected')}
                      className="btn-hover bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No pending seller applications</p>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Order #{selectedOrder.id.slice(-8)}
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancellation:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 mb-4"
              rows={4}
              required
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                  setCancellationReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancellationReason.trim()}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper component ---
function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="card-hover bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
      <div className="flex items-center">
        <div className="p-3 bg-primary-green/10 rounded-xl text-3xl">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-primary-green">{value}</p>
        </div>
      </div>
    </div>
  );
}
