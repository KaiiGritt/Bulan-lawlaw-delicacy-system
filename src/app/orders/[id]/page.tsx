'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
}

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
  orderItems: OrderItem[];
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && orderId) {
      fetchOrderDetails();
    }
  }, [status, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed' },
      { key: 'processing', label: 'Processing' },
      { key: 'shipped', label: 'Shipped' },
      { key: 'delivered', label: 'Delivered' },
    ];

    if (order?.status === 'cancelled') {
      return [
        { key: 'pending', label: 'Order Placed' },
        { key: 'cancelled', label: 'Cancelled' },
      ];
    }

    return steps;
  };

  const getCurrentStepIndex = () => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    if (order?.status === 'cancelled') return 1;
    return statusOrder.indexOf(order?.status || 'pending');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
          </div>

          {/* Order Header Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg mb-6 animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            </div>

            {/* Status Progress Skeleton */}
            <div className="flex justify-between items-center mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Order Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:from-leaf-green hover:to-soft-green transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const steps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700"
        >
          <Link
            href="/profile"
            className="text-primary-green hover:text-leaf-green dark:text-green-400 dark:hover:text-green-300 flex items-center gap-2 mb-4 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Order ID: <span className="font-mono font-semibold">#{order.id.slice(0, 12)}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap w-fit ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
              order.status === 'processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
            }`}>
              {order.status.toUpperCase()}
            </div>
          </div>
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">Order Status</h2>

          {/* Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-primary-green to-leaf-green transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-2 sm:flex sm:justify-between gap-4 sm:gap-0 relative">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isActive = index === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center sm:items-center text-center relative">
                    {/* Icon Circle */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-primary-green to-leaf-green border-primary-green text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                    } ${isActive ? 'ring-4 ring-primary-green/30 scale-110' : ''}`}>
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="8" strokeWidth={2} />
                        </svg>
                      )}
                    </div>

                    {/* Label */}
                    <p className={`mt-3 text-xs sm:text-sm font-medium transition-colors ${
                      isCompleted ? 'text-primary-green dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </p>

                    {/* Date (if applicable) */}
                    {isCompleted && (
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {index === currentStep ? new Date(order.updatedAt).toLocaleDateString() : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancellation Message */}
          {order.status === 'cancelled' && order.cancellationReason && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-300">Cancellation Reason</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{order.cancellationReason}</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                    Cancelled on {new Date(order.cancelledAt!).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>

          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <img
                  src={item.product.image || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-primary-green dark:hover:text-green-400 line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Category: {item.product.category}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Quantity: <span className="font-semibold">x{item.quantity}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm sm:text-base font-bold text-primary-green">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per item</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Order Total</span>
              <span className="text-xl sm:text-2xl font-bold text-primary-green">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Shipping & Billing Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Shipping Address</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {order.shippingAddress}
            </p>
          </div>

          {/* Billing Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Billing Address</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {order.billingAddress}
            </p>
          </div>
        </motion.div>

        {/* Payment Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Payment Method</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {order.paymentMethod}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <p>Order placed on: <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span></p>
            <p className="mt-1">Last updated: <span className="font-medium">{new Date(order.updatedAt).toLocaleString()}</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
