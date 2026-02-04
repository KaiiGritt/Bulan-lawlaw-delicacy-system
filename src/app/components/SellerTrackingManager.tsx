'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SellerTrackingManagerProps {
 orderId: string;
 currentStatus: string;
 onUpdate?: () => void;
}

export default function SellerTrackingManager({
 orderId,
 currentStatus,
 onUpdate
}: SellerTrackingManagerProps) {
 const [loading, setLoading] = useState(false);

 const getStatusDescription = (status: string) => {
 switch (status) {
 case 'preparing':
 return 'Order is being prepared';
 case 'ready':
 return 'Order is ready for pickup';
 default:
 return 'Order status updated';
 }
 };

 const handleStatusUpdate = async (newStatus: string) => {
 setLoading(true);

 try {
 const res = await fetch(`/api/orders/${orderId}/tracking`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 status: newStatus,
 description: getStatusDescription(newStatus)
 })
 });

 if (!res.ok) {
 throw new Error('Failed to update status');
 }

 const statusLabel = newStatus === 'preparing' ? 'Preparing' : 'Ready for Pickup';
 toast.success(`Order marked as ${statusLabel}!`);
 onUpdate?.();
 } catch (error: any) {
 toast.error(error.message || 'Failed to update status');
 } finally {
 setLoading(false);
 }
 };

 // Don't show buttons if order is already completed or cancelled
 if (currentStatus === 'ready' || currentStatus === 'cancelled') {
 return null;
 }

 return (
 <div className="space-y-3">
 <p className="text-sm font-medium text-gray-700">Update Order Status:</p>
 <div className="flex flex-col sm:flex-row gap-2">
 {/* Show Preparing button only if status is pending */}
 {currentStatus === 'pending' && (
 <button
 onClick={() => handleStatusUpdate('preparing')}
 disabled={loading}
 className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
 </svg>
 )}
 Mark as Preparing
 </button>
 )}

 {/* Show Ready for Pickup button if status is pending or preparing */}
 {(currentStatus === 'pending' || currentStatus === 'preparing') && (
 <button
 onClick={() => handleStatusUpdate('ready')}
 disabled={loading}
 className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 )}
 Mark as Ready for Pickup
 </button>
 )}
 </div>
 </div>
 );
}
