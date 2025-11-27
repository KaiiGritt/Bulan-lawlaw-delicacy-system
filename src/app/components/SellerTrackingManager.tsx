'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SellerTrackingManagerProps {
 orderId: string;
 currentStatus: string;
 trackingNumber?: string | null;
 courier?: string | null;
 estimatedDeliveryDate?: string | null;
 onUpdate?: () => void;
}

export default function SellerTrackingManager({
 orderId,
 currentStatus,
 trackingNumber: initialTrackingNumber,
 courier: initialCourier,
 estimatedDeliveryDate: initialEstimatedDate,
 onUpdate
}: SellerTrackingManagerProps) {
 const [showForm, setShowForm] = useState(false);
 const [loading, setLoading] = useState(false);

 // Tracking info form
 const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
 const [courier, setCourier] = useState(initialCourier || '');
 const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
 initialEstimatedDate ? new Date(initialEstimatedDate).toISOString().split('T')[0] : ''
 );

 // Status update form
 const [showStatusForm, setShowStatusForm] = useState(false);
 const [newStatus, setNewStatus] = useState('');
 const [location, setLocation] = useState('');
 const [description, setDescription] = useState('');

 const couriers = ['J&T Express', 'LBC', 'Lalamove', 'Grab Express', 'Flash Express', 'Ninja Van', 'GoGo Express', 'Other'];

 const handleUpdateTrackingInfo = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);

 try {
 const res = await fetch(`/api/orders/${orderId}/tracking`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 trackingNumber: trackingNumber || null,
 courier: courier || null,
 estimatedDeliveryDate: estimatedDeliveryDate || null
 })
 });

 if (!res.ok) {
 throw new Error('Failed to update tracking info');
 }

 toast.success('Tracking information updated successfully!');
 setShowForm(false);
 onUpdate?.();
 } catch (error: any) {
 toast.error(error.message || 'Failed to update tracking info');
 } finally {
 setLoading(false);
 }
 };

 const handleAddStatusUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);

 try {
 const res = await fetch(`/api/orders/${orderId}/tracking`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 status: newStatus,
 location: location || null,
 description
 })
 });

 if (!res.ok) {
 throw new Error('Failed to add status update');
 }

 toast.success('Status update added successfully!');
 setShowStatusForm(false);
 setNewStatus('');
 setLocation('');
 setDescription('');
 onUpdate?.();
 } catch (error: any) {
 toast.error(error.message || 'Failed to add status update');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="space-y-4">
 {/* Update Tracking Info Button */}
 <div className="flex gap-2">
 <button
 onClick={() => setShowForm(!showForm)}
 className="flex-1 bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 {showForm ? 'Cancel' : 'Update Tracking Info'}
 </button>

 <button
 onClick={() => setShowStatusForm(!showStatusForm)}
 className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 {showStatusForm ? 'Cancel' : 'Add Status Update'}
 </button>
 </div>

 {/* Tracking Info Form */}
 {showForm && (
 <motion.form
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 onSubmit={handleUpdateTrackingInfo}
 className="bg-gray-50 rounded-lg p-6 space-y-4"
 >
 <h3 className="font-semibold text-lg text-gray-900 mb-4">
 Update Tracking Information
 </h3>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Tracking Number
 </label>
 <input
 type="text"
 value={trackingNumber}
 onChange={(e) => setTrackingNumber(e.target.value)}
 placeholder="e.g., JT1234567890"
 className="w-full p-3 rounded-lg border bg-white text-gray-900"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Courier Service
 </label>
 <select
 value={courier}
 onChange={(e) => setCourier(e.target.value)}
 className="w-full p-3 rounded-lg border bg-white text-gray-900"
 >
 <option value="">Select Courier</option>
 {couriers.map((c) => (
 <option key={c} value={c}>{c}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Estimated Delivery Date
 </label>
 <input
 type="date"
 value={estimatedDeliveryDate}
 onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
 min={new Date().toISOString().split('T')[0]}
 className="w-full p-3 rounded-lg border bg-white text-gray-900"
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-leaf-green transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 Updating...
 </>
 ) : (
 <>
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 Update Tracking Info
 </>
 )}
 </button>
 </motion.form>
 )}

 {/* Status Update Form */}
 {showStatusForm && (
 <motion.form
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 onSubmit={handleAddStatusUpdate}
 className="bg-blue-50 rounded-lg p-6 space-y-4"
 >
 <h3 className="font-semibold text-lg text-gray-900 mb-4">
 Add Status Update
 </h3>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Status *
 </label>
 <select
 value={newStatus}
 onChange={(e) => setNewStatus(e.target.value)}
 required
 className="w-full p-3 rounded-lg border bg-white text-gray-900"
 >
 <option value="">Select Status</option>
 <option value="pending">Pending</option>
 <option value="processing">Processing</option>
 <option value="shipped">Shipped</option>
 <option value="out_for_delivery">Out for Delivery</option>
 <option value="delivered">Delivered</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Location (Optional)
 </label>
 <input
 type="text"
 value={location}
 onChange={(e) => setLocation(e.target.value)}
 placeholder="e.g., Manila Sorting Facility"
 className="w-full p-3 rounded-lg border bg-white text-gray-900"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Description *
 </label>
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 required
 rows={3}
 placeholder="e.g., Package has arrived at sorting facility"
 className="w-full p-3 rounded-lg border bg-white text-gray-900"
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 Adding...
 </>
 ) : (
 <>
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 Add Status Update
 </>
 )}
 </button>
 </motion.form>
 )}
 </div>
 );
}
