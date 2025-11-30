'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
      category: string;
    };
  }>;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancellationReason }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancellationReason('');
        fetchOrders();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order');
    }
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'processing'].includes(order.status);
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-3"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            My Orders
          </motion.h1>
          <p className="text-gray-600 mt-2">Track and manage your order history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              key: 'all',
              label: 'All Orders',
              count: orders.length,
              color: 'bg-gray-100 text-gray-800 border-gray-200',
              iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
            },
            {
              key: 'pending',
              label: 'To Pay',
              count: orders.filter(o => o.status === 'pending').length,
              color: 'bg-orange-100 text-orange-800 border-orange-200',
              iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
            },
            {
              key: 'processing',
              label: 'To Ship',
              count: orders.filter(o => o.status === 'processing').length,
              color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
            },
            {
              key: 'shipped',
              label: 'To Receive',
              count: orders.filter(o => o.status === 'shipped').length,
              color: 'bg-blue-100 text-blue-800 border-blue-200',
              iconPath: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
            },
            {
              key: 'delivered',
              label: 'Completed',
              count: orders.filter(o => o.status === 'delivered').length,
              color: 'bg-green-100 text-green-800 border-green-200',
              iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            },
            {
              key: 'cancelled',
              label: 'Cancelled',
              count: orders.filter(o => o.status === 'cancelled').length,
              color: 'bg-red-100 text-red-800 border-red-200',
              iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
            },
          ].map((stat) => (
            <motion.button
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveTab(stat.key as typeof activeTab)}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                activeTab === stat.key
                  ? 'ring-2 ring-primary-green ' + stat.color
                  : stat.color
              }`}
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconPath} />
              </svg>
              <p className="text-xs sm:text-sm font-medium">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.count}</p>
            </motion.button>
          ))}
        </div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-12 text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'all'
                  ? "You haven't placed any orders yet"
                  : `You have no ${activeTab} orders`}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-soft-green/20 overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-green/10 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Cancellation Notice */}
                  {order.cancellationReason && (
                    <div className="px-4 sm:px-6 py-3 bg-red-50 border-b border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>Cancellation Reason:</strong> {order.cancellationReason}
                      </p>
                      {order.cancelledAt && (
                        <p className="text-xs text-red-600 mt-1">
                          Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Body */}
                  <div className="p-4 sm:p-6">
                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img
                            src={item.product.image || '/placeholder.png'}
                            alt={item.product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-medium text-gray-900 hover:text-primary-green line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary-green mt-1">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Total</p>
                        <p className="text-2xl font-bold text-primary-green">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: {order.paymentMethod}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-primary-green to-leaf-green text-white text-sm font-medium hover:shadow-md transition-all text-center"
                        >
                          View Details
                        </Link>
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancelModal(true);
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
                          >
                            Cancel Order
                          </button>
                        )}
                        <Link
                          href={`/chat?orderId=${order.id}`}
                          className="px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 text-sm font-medium transition-all"
                          title="Contact Seller"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Cancellation Modal */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Cancel Order #{selectedOrder.id.slice(0, 12)}
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for cancellation:
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                rows={4}
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedOrder(null);
                    setCancellationReason('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancellationReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
