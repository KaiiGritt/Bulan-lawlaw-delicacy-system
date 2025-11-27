'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TrackingHistoryItem {
 id: string;
 status: string;
 location: string | null;
 description: string;
 createdAt: string;
}

interface OrderTrackingData {
 orderId: string;
 status: string;
 trackingNumber: string | null;
 courier: string | null;
 estimatedDeliveryDate: string | null;
 shippedAt: string | null;
 deliveredAt: string | null;
 trackingHistory: TrackingHistoryItem[];
}

interface OrderTrackingProps {
 orderId: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
 const [tracking, setTracking] = useState<OrderTrackingData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
 fetchTracking();
 }, [orderId]);

 const fetchTracking = async () => {
 try {
 setLoading(true);
 const res = await fetch(`/api/orders/${orderId}/tracking`);

 if (!res.ok) {
 throw new Error('Failed to fetch tracking info');
 }

 const data = await res.json();
 setTracking(data);
 } catch (err: any) {
 setError(err.message || 'Failed to load tracking information');
 } finally {
 setLoading(false);
 }
 };

 const getStatusColor = (status: string) => {
 const statusColors: Record<string, string> = {
 pending: 'bg-yellow-100 text-yellow-800',
 processing: 'bg-blue-100 text-blue-800',
 shipped: 'bg-purple-100 text-purple-800',
 delivered: 'bg-green-100 text-green-800',
 cancelled: 'bg-red-100 text-red-800',
 };
 return statusColors[status] || 'bg-gray-100 text-gray-800';
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'pending':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 case 'processing':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 );
 case 'shipped':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
 </svg>
 );
 case 'delivered':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 case 'cancelled':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 default:
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 }
 };

 if (loading) {
 return (
 <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
 <div className="space-y-3">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-20 bg-gray-200 rounded"></div>
 ))}
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
 <p className="text-red-600">{error}</p>
 </div>
 );
 }

 if (!tracking) {
 return null;
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white rounded-2xl p-6 shadow-lg border border-soft-green/20"
 >
 <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
 <svg className="w-7 h-7 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
 </svg>
 Order Tracking
 </h2>

 {/* Current Status */}
 <div className="mb-6 p-4 bg-gradient-to-r from-primary-green/10 to-leaf-green/10 rounded-xl">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <p className="text-sm text-gray-600 mb-1">Current Status</p>
 <div className="flex items-center gap-2">
 <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${getStatusColor(tracking.status)}`}>
 {getStatusIcon(tracking.status)}
 {tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1)}
 </span>
 </div>
 </div>

 {tracking.trackingNumber && (
 <div>
 <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
 <p className="text-lg font-semibold text-gray-900 font-mono">
 {tracking.trackingNumber}
 </p>
 </div>
 )}

 {tracking.courier && (
 <div>
 <p className="text-sm text-gray-600 mb-1">Courier</p>
 <p className="text-lg font-semibold text-gray-900">
 {tracking.courier}
 </p>
 </div>
 )}
 </div>

 {tracking.estimatedDeliveryDate && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <p className="text-sm text-gray-600">Estimated Delivery</p>
 <p className="text-lg font-semibold text-primary-green">
 {new Date(tracking.estimatedDeliveryDate).toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })}
 </p>
 </div>
 )}
 </div>

 {/* Tracking Timeline */}
 <div className="space-y-4">
 <h3 className="font-semibold text-lg text-gray-900 mb-4">Tracking History</h3>

 {tracking.trackingHistory.length === 0 ? (
 <div className="text-center py-8 text-gray-500">
 <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 <p>No tracking updates yet</p>
 </div>
 ) : (
 <div className="relative">
 {/* Timeline line */}
 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

 {tracking.trackingHistory.map((item, index) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className="relative pl-12 pb-8 last:pb-0"
 >
 {/* Timeline dot */}
 <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
 index === 0
 ? 'bg-primary-green text-white'
 : 'bg-gray-300 text-gray-600'
 }`}>
 {getStatusIcon(item.status)}
 </div>

 <div className="bg-gray-50 rounded-lg p-4">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${getStatusColor(item.status)}`}>
 {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
 </span>
 <p className="text-gray-900 font-medium mb-1">
 {item.description}
 </p>
 {item.location && (
 <p className="text-sm text-gray-600 flex items-center gap-1">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 {item.location}
 </p>
 )}
 </div>
 <div className="text-right">
 <p className="text-sm text-gray-600">
 {new Date(item.createdAt).toLocaleDateString()}
 </p>
 <p className="text-xs text-gray-500">
 {new Date(item.createdAt).toLocaleTimeString()}
 </p>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 );
}
