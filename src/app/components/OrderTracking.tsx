'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TrackingHistoryItem {
 id: string;
 status: string;
 description: string;
 createdAt: string;
}

interface OrderTrackingData {
 orderId: string;
 status: string;
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
 pending: 'bg-orange-100 text-orange-800',
 preparing: 'bg-yellow-100 text-yellow-800',
 ready: 'bg-green-100 text-green-800',
 cancelled: 'bg-red-100 text-red-800',
 };
 return statusColors[status] || 'bg-gray-100 text-gray-800';
 };

 const getStatusLabel = (status: string) => {
 const labels: Record<string, string> = {
 pending: 'Order Placed',
 preparing: 'Preparing',
 ready: 'Ready for Pickup',
 cancelled: 'Cancelled',
 };
 return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'pending':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
 </svg>
 );
 case 'preparing':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
 </svg>
 );
 case 'ready':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 );
 case 'cancelled':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 Order Status
 </h2>

 {/* Current Status */}
 <div className="mb-6 p-4 bg-gradient-to-r from-primary-green/10 to-leaf-green/10 rounded-xl">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <p className="text-sm text-gray-600 mb-1">Current Status</p>
 <div className="flex items-center gap-2">
 <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${getStatusColor(tracking.status)}`}>
 {getStatusIcon(tracking.status)}
 {getStatusLabel(tracking.status)}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Status History */}
 <div className="space-y-4">
 <h3 className="font-semibold text-lg text-gray-900 mb-4">Status History</h3>

 {tracking.trackingHistory.length === 0 ? (
 <div className="text-center py-8 text-gray-500">
 <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 <p>No status updates yet</p>
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
 {getStatusLabel(item.status)}
 </span>
 <p className="text-gray-900 font-medium mb-1">
 {item.description}
 </p>
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
