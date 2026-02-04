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

interface TrackingHistoryItem {
 id: string;
 status: string;
 description: string;
 createdAt: string;
}

interface TrackingInfo {
 orderId: string;
 status: string;
 trackingHistory: TrackingHistoryItem[];
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
 const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
 const [loadingTracking, setLoadingTracking] = useState(false);

 useEffect(() => {
 if (status === 'unauthenticated') {
 router.push('/login');
 return;
 }

 if (status === 'authenticated' && orderId) {
 fetchOrderDetails();
 fetchTrackingInfo();
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

 const fetchTrackingInfo = async () => {
 setLoadingTracking(true);
 try {
 const res = await fetch(`/api/orders/${orderId}/tracking`, {
 credentials: 'include',
 });

 if (res.ok) {
 const data = await res.json();
 setTrackingInfo(data);
 }
 } catch (error) {
 console.error('Error fetching tracking info:', error);
 } finally {
 setLoadingTracking(false);
 }
 };

 const getStatusSteps = () => {
 const steps = [
 { key: 'pending', label: 'Order Placed' },
 { key: 'preparing', label: 'Preparing' },
 { key: 'ready', label: 'Ready for Pickup' },
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
 const statusOrder = ['pending', 'preparing', 'ready'];
 if (order?.status === 'cancelled') return 1;
 return statusOrder.indexOf(order?.status || 'pending');
 };

 if (loading || status === 'loading') {
 return (
 <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-4xl mx-auto">
 {/* Back Button Skeleton */}
 <div className="mb-6 animate-pulse">
 <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
 </div>

 {/* Order Header Skeleton */}
 <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg mb-6 animate-pulse">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <div className="space-y-2">
 <div className="h-8 bg-gray-200 rounded w-48"></div>
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 </div>
 <div className="h-6 bg-gray-200 rounded-full w-24"></div>
 </div>

 {/* Status Progress Skeleton */}
 <div className="flex justify-between items-center mb-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex-1 flex flex-col items-center">
 <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
 <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
 </div>
 ))}
 </div>
 </div>

 {/* Order Items Skeleton */}
 <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
 <div className="space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
 <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
 <div className="flex-1 space-y-2">
 <div className="h-5 bg-gray-200 rounded w-3/4"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 <div className="text-right space-y-2">
 <div className="h-5 bg-gray-200 rounded w-16 ml-auto"></div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Order Summary Skeleton */}
 <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
 <div className="space-y-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex justify-between">
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 <div className="h-4 bg-gray-200 rounded w-24"></div>
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
 <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-4xl mx-auto">
 <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
 <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <h2 className="text-2xl font-bold text-gray-700 mb-2">Order Not Found</h2>
 <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
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
 <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
 <Toaster position="top-right" />

 <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20"
 >
 <Link
 href="/profile"
 className="text-primary-green hover:text-leaf-green flex items-center gap-2 mb-4 text-sm sm:text-base"
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
 <p className="text-sm sm:text-base text-gray-600 mt-1">
 Order ID: <span className="font-mono font-semibold">#{order.id.slice(0, 12)}</span>
 </p>
 </div>
 <div className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap w-fit ${
 order.status === 'ready' ? 'bg-green-100 text-green-700' :
 order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
 order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
 'bg-orange-100 text-orange-700'
 }`}>
 {order.status === 'pending' ? 'ORDER PLACED' :
 order.status === 'preparing' ? 'PREPARING' :
 order.status === 'ready' ? 'READY FOR PICKUP' :
 order.status.toUpperCase()}
 </div>
 </div>
 </motion.div>

 {/* Order Status Timeline */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20"
 >
 <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Order Status</h2>

 {/* Timeline */}
 <div className="relative">
 {/* Progress Line */}
 <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 hidden sm:block">
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
 : 'bg-white border-gray-300 text-gray-400'
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
 isCompleted ? 'text-primary-green' : 'text-gray-500'
 }`}>
 {step.label}
 </p>

 {/* Date (if applicable) */}
 {isCompleted && (
 <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
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
 <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-start gap-3">
 <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <p className="font-semibold text-red-900">Cancellation Reason</p>
 <p className="text-sm text-red-700 mt-1">{order.cancellationReason}</p>
 <p className="text-xs text-red-600 mt-2">
 Cancelled on {new Date(order.cancelledAt!).toLocaleString()}
 </p>
 </div>
 </div>
 </div>
 )}
 </motion.div>

 {/* Order Status History */}
 {trackingInfo && trackingInfo.trackingHistory && trackingInfo.trackingHistory.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20"
 >
 <div className="flex items-center gap-2 mb-6">
 <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <h2 className="text-lg sm:text-xl font-bold text-gray-900">Status History</h2>
 </div>

 <div className="relative">
 {/* Vertical Timeline Line */}
 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-green to-leaf-green"></div>

 {/* Timeline Items */}
 <div className="space-y-6">
 {trackingInfo.trackingHistory.map((item, index) => {
 const getStatusLabel = (status: string) => {
 const labels: Record<string, string> = {
 pending: 'Order Placed',
 preparing: 'Preparing',
 ready: 'Ready for Pickup',
 cancelled: 'Cancelled',
 };
 return labels[status] || status;
 };

 return (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className="relative pl-12"
 >
 {/* Timeline Dot */}
 <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
 index === 0
 ? 'bg-gradient-to-r from-primary-green to-leaf-green ring-4 ring-primary-green/20'
 : 'bg-white border-2 border-primary-green'
 }`}>
 {index === 0 ? (
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
 </svg>
 ) : (
 <div className="w-3 h-3 rounded-full bg-primary-green"></div>
 )}
 </div>

 {/* Content */}
 <div className={`bg-gradient-to-r p-4 rounded-lg ${
 index === 0
 ? 'from-primary-green/10 to-leaf-green/10 border-2 border-primary-green/30'
 : 'from-gray-50 to-gray-100 border border-gray-200'
 }`}>
 <div className="flex items-start justify-between gap-4 mb-2">
 <div>
 <p className={`font-bold ${index === 0 ? 'text-primary-green' : 'text-gray-900'}`}>
 {item.description}
 </p>
 </div>
 <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
 item.status === 'ready' ? 'bg-green-100 text-green-700' :
 item.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
 item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
 'bg-orange-100 text-orange-700'
 }`}>
 {getStatusLabel(item.status)}
 </span>
 </div>
 <p className="text-xs text-gray-500 flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 {new Date(item.createdAt).toLocaleString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: 'numeric',
 minute: '2-digit',
 hour12: true
 })}
 </p>
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 </motion.div>
 )}

 {/* Order Items */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20"
 >
 <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Order Items</h2>

 <div className="space-y-4">
 {order.orderItems.map((item) => (
 <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
 <img
 src={item.product.image || '/placeholder.png'}
 alt={item.product.name}
 className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
 />
 <div className="flex-1 min-w-0">
 <Link
 href={`/products/${item.product.id}`}
 className="font-semibold text-sm sm:text-base text-gray-900 hover:text-primary-green line-clamp-2"
 >
 {item.product.name}
 </Link>
 <p className="text-xs sm:text-sm text-gray-500 mt-1">
 Category: {item.product.category}
 </p>
 <p className="text-xs sm:text-sm text-gray-600 mt-2">
 Quantity: <span className="font-semibold">x{item.quantity}</span>
 </p>
 </div>
 <div className="text-right flex-shrink-0">
 <p className="text-sm sm:text-base font-bold text-primary-green">₱{item.price.toFixed(2)}</p>
 <p className="text-xs text-gray-500 mt-1">per item</p>
 <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-2">
 ₱{(item.price * item.quantity).toFixed(2)}
 </p>
 </div>
 </div>
 ))}
 </div>

 {/* Order Summary */}
 <div className="mt-6 pt-6 border-t border-gray-200">
 <div className="flex justify-between items-center">
 <span className="text-base sm:text-lg font-bold text-gray-900">Order Total</span>
 <span className="text-xl sm:text-2xl font-bold text-primary-green">₱{order.totalAmount.toFixed(2)}</span>
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
 <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20">
 <div className="flex items-center gap-2 mb-4">
 <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 <h3 className="text-base sm:text-lg font-bold text-gray-900">Shipping Address</h3>
 </div>
 <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
 {order.shippingAddress}
 </p>
 </div>

 {/* Billing Address */}
 <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20">
 <div className="flex items-center gap-2 mb-4">
 <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <h3 className="text-base sm:text-lg font-bold text-gray-900">Billing Address</h3>
 </div>
 <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
 {order.billingAddress}
 </p>
 </div>
 </motion.div>

 {/* Payment Information */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20"
 >
 <div className="flex items-center gap-2 mb-4">
 <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
 </svg>
 <h3 className="text-base sm:text-lg font-bold text-gray-900">Payment Method</h3>
 </div>
 <p className="text-sm sm:text-base text-gray-700">
 {order.paymentMethod}
 </p>
 <div className="mt-4 pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-500">
 <p>Order placed on: <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span></p>
 <p className="mt-1">Last updated: <span className="font-medium">{new Date(order.updatedAt).toLocaleString()}</span></p>
 </div>
 </motion.div>
 </div>
 </div>
 );
}
