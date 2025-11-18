'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    user: {
      name: string;
      email: string;
    };
    orderItems: Array<{
      product: {
        name: string;
      };
    }>;
  }>;
  pendingProducts: Array<{
    id: string;
    name: string;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">Error: {error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50">
      {/* Admin Header - Using same styling as main Header */}
      <header className="glassmorphism sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
            <Image
              src="/logo.png"
              alt="Lawlaw Delights Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-primary-green hover:text-leaf-green transition-colors duration-300">
              Admin Dashboard
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">Welcome, Admin</span>
            <Link href="/" className="btn-hover text-primary-green hover:text-leaf-green text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/60">
              ← Back to Site
            </Link>
            <button className="btn-hover bg-warm-orange text-white px-4 py-2 rounded-xl hover:bg-earth-brown text-sm font-medium transition-colors duration-200">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'products', label: 'Products', icon: '📦' },
              { id: 'orders', label: 'Orders', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary-green text-white shadow-md'
                    : 'text-gray-700 hover:bg-white/60 hover:text-primary-green'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-hover bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-green/10 rounded-xl">
                    <span className="text-3xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-primary-green">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="card-hover bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center">
                  <div className="p-3 bg-banana-leaf/10 rounded-xl">
                    <span className="text-3xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold text-primary-green">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="card-hover bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center">
                  <div className="p-3 bg-warm-orange/10 rounded-xl">
                    <span className="text-3xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-primary-green">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="card-hover bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center">
                  <div className="p-3 bg-earth-brown/10 rounded-xl">
                    <span className="text-3xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary-green">₱{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-bold text-primary-green mb-6">Recent Orders</h3>
                <div className="space-y-4">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-semibold text-gray-900">{order.user.name || order.user.email}</p>
                          <p className="text-sm text-gray-600">
                            {order.orderItems.length > 0 ? order.orderItems[0].product.name : 'Order'}
                            {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-green">₱{order.totalAmount}</p>
                          <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium mt-1 ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                  )}
                </div>
                <Link href="/admin/orders" className="btn-hover text-primary-green hover:text-leaf-green text-sm font-medium mt-4 inline-block transition-colors duration-200">
                  View all orders →
                </Link>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-bold text-primary-green mb-6">Pending Product Approvals</h3>
                <div className="space-y-4">
                  {stats.pendingProducts.length > 0 ? (
                    stats.pendingProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">by {product.user.name}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="btn-hover bg-primary-green text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-leaf-green transition-colors duration-200">
                            Approve
                          </button>
                          <button className="btn-hover bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors duration-200">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No pending products</p>
                  )}
                </div>
                <Link href="/admin/products" className="btn-hover text-primary-green hover:text-leaf-green text-sm font-medium mt-4 inline-block transition-colors duration-200">
                  Manage all products →
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
            <h3 className="text-2xl font-bold text-primary-green mb-4">User Management</h3>
            <p className="text-gray-600 mb-6">Manage registered users, vendors, and administrators.</p>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users: {stats?.totalUsers || 0}</span>
                <button className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green text-sm font-medium transition-colors duration-200">
                  Export Users
                </button>
              </div>
              {/* User table would go here */}
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-lg font-medium">User management interface</p>
                <p className="text-sm">Detailed user table will be implemented here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Product Management</h3>
            <p className="text-gray-600 mb-6">Approve, reject, or remove products from the marketplace.</p>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Products: {stats?.totalProducts || 0}</span>
                <div className="space-x-3">
                  <button className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green text-sm font-medium transition-colors duration-200">
                    Bulk Approve
                  </button>
                  <button className="btn-hover bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-700 text-sm font-medium transition-colors duration-200">
                    Bulk Reject
                  </button>
                </div>
              </div>
              {/* Product management table would go here */}
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-lg font-medium">Product approval interface</p>
                <p className="text-sm">Product management table will be implemented here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Order Management</h3>
            <p className="text-gray-600 mb-6">View and manage customer orders, update statuses, and handle fulfillment.</p>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders: {stats?.totalOrders || 0}</span>
                <button className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green text-sm font-medium transition-colors duration-200">
                  Export Orders
                </button>
              </div>
              {/* Order management table would go here */}
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium">Order management interface</p>
                <p className="text-sm">Order tracking and fulfillment will be implemented here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Analytics & Reports</h3>
            <p className="text-gray-600 mb-6">View detailed analytics about platform performance, sales, and user engagement.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-primary-green/5 to-banana-leaf/5 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">📈</div>
                <p className="text-lg font-medium">Sales Analytics</p>
                <p className="text-sm">Revenue trends and performance metrics</p>
              </div>
              <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-warm-orange/5 to-earth-brown/5 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-lg font-medium">User Growth</p>
                <p className="text-sm">Registration and engagement statistics</p>
              </div>
              <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-banana-leaf/5 to-leaf-green/5 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">🏆</div>
                <p className="text-lg font-medium">Popular Products</p>
                <p className="text-sm">Best-selling items and trends</p>
              </div>
              <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-earth-brown/5 to-primary-green/5 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">💰</div>
                <p className="text-lg font-medium">Revenue Reports</p>
                <p className="text-sm">Financial performance and projections</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
