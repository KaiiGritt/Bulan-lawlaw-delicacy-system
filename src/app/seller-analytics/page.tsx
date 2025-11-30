'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function SellerAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    // Check if user is a seller
    if (session.user?.role !== 'seller') {
      toast.error('Access denied. Sellers only.');
      router.push('/profile');
      return;
    }
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seller/stats', { credentials: 'include' });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const getMonthlyRevenue = () => {
    if (!stats) return [];
    // This is a placeholder - you would calculate this from actual order data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: stats.totalRevenue * (Math.random() * 0.3 + 0.1),
    }));
  };

  const getOrderStatusBreakdown = () => {
    if (!stats || !stats.recentOrders) return [];
    const statusCount: Record<string, number> = {};
    stats.recentOrders.forEach((order) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow h-96"></div>
              <div className="bg-white p-6 rounded-xl shadow h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyRevenue = getMonthlyRevenue();
  const orderBreakdown = getOrderStatusBreakdown();
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-3">
            <svg className="w-10 h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Sales Analytics
          </h1>
          <p className="text-gray-600 mt-2">Track your business performance and growth</p>
        </div>

        {stats && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Products</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-soft-green/20"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Monthly Revenue
                </h2>
                <div className="space-y-4">
                  {monthlyRevenue.map((data) => (
                    <div key={data.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{data.month}</span>
                        <span className="text-primary-green font-semibold">
                          ${data.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary-green to-leaf-green h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Order Status Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-soft-green/20"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Order Status
                </h2>
                <div className="space-y-4">
                  {orderBreakdown.map((data) => {
                    const colorMap: Record<string, string> = {
                      pending: 'bg-orange-500',
                      processing: 'bg-yellow-500',
                      shipped: 'bg-blue-500',
                      delivered: 'bg-green-500',
                      cancelled: 'bg-red-500',
                    };
                    return (
                      <div key={data.status} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colorMap[data.status] || 'bg-gray-500'}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {data.status}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{data.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${colorMap[data.status] || 'bg-gray-500'}`}
                              style={{
                                width: `${(data.count / stats.recentOrders.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {orderBreakdown.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>No order data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Performance Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-soft-green/20"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Performance Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Products Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalProducts - stats.pendingProducts}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingProducts}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalProducts > 0
                      ? ((stats.totalProducts - stats.pendingProducts) / stats.totalProducts * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
