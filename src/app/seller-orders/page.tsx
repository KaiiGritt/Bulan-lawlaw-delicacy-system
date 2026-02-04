'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface SellerOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  orderItems: Array<{ product: { name: string }; quantity: number }>;
}

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>('all');

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
    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Update failed');
      fetchOrders();
      toast.success('Order status updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-12 px-4 sm:px-6 lg:px-8">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Order Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and process customer orders</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              key: 'all',
              label: 'All Orders',
              count: orders.length,
              color: 'bg-gray-100 text-gray-800 border-gray-200',
            },
            {
              key: 'pending',
              label: 'Order Placed',
              count: orders.filter((o) => o.status === 'pending').length,
              color: 'bg-orange-100 text-orange-800 border-orange-200',
            },
            {
              key: 'preparing',
              label: 'Preparing',
              count: orders.filter((o) => o.status === 'preparing').length,
              color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            },
            {
              key: 'ready',
              label: 'Ready for Pickup',
              count: orders.filter((o) => o.status === 'ready').length,
              color: 'bg-green-100 text-green-800 border-green-200',
            },
            {
              key: 'cancelled',
              label: 'Cancelled',
              count: orders.filter((o) => o.status === 'cancelled').length,
              color: 'bg-red-100 text-red-800 border-red-200',
            },
          ].map((stat) => (
            <motion.button
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setOrderFilter(stat.key)}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                orderFilter === stat.key
                  ? 'ring-2 ring-primary-green ' + stat.color
                  : stat.color
              }`}
            >
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.count}</p>
            </motion.button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-soft-green/20 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-green/10 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-primary-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 12)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    order.status === 'ready'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'preparing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {order.status === 'pending' ? 'ORDER PLACED' :
                   order.status === 'preparing' ? 'PREPARING' :
                   order.status === 'ready' ? 'READY FOR PICKUP' :
                   order.status.toUpperCase()}
                </span>
              </div>

              {/* Order Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-primary-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Name:</span> {order.user.name}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> {order.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-primary-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Order Items
                    </h4>
                    <div className="space-y-2 text-sm">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span>
                            {item.product.name} x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Total</p>
                    <p className="text-2xl font-bold text-primary-green">
                      ₱{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm font-medium"
                    >
                      {[
                        { value: 'pending', label: 'Order Placed' },
                        { value: 'preparing', label: 'Preparing' },
                        { value: 'ready', label: 'Ready for Pickup' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ].map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-12 text-center">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {orderFilter === 'all'
                  ? "You haven't received any orders yet"
                  : `You have no ${orderFilter} orders`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
