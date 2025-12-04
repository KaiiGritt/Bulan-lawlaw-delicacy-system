

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UsersTab from "./UsersTab";
import OverviewCharts from "./components/OverviewCharts";
import toast, { Toaster } from 'react-hot-toast';
import {
 CheckCircleIcon,
 XCircleIcon,
 ChevronDownIcon,
 ChevronUpIcon,
 Bars3Icon,
 ArrowLeftIcon,
 ShieldCheckIcon,
 UsersIcon,
 CubeIcon,
 ClipboardDocumentListIcon,
 ChartBarIcon,
 DocumentTextIcon,
 ChatBubbleLeftRightIcon,
 CurrencyDollarIcon,
 ArrowRightOnRectangleIcon,
 ExclamationTriangleIcon,
 TruckIcon,
 ShoppingCartIcon,
 StarIcon,
 TrashIcon,
 ChartPieIcon,
 UserGroupIcon,
 BuildingStorefrontIcon,
 ReceiptPercentIcon,
 PlusIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'overview' | 'users' | 'products' | 'orders' | 'analytics' | 'sellerApplications' | 'messages';


interface AdminStats {
 totalUsers: number;
 totalProducts: number;
 totalOrders: number;
 totalRevenue: number;
 pendingSellerApplications: Array<{
 id: string;
 businessName: string;
 businessType: string;
 status: string;
 createdAt: string;
 user: { id: string; name: string | null; email: string };
 }>;
}

interface OrderItem {
 id: string;
 quantity: number;
 price: number;
 product: {
 id: string;
 name: string;
 image?: string;
 };
}

interface Order {
 id: string;
 status: string;
 totalAmount: number;
 shippingAddress: string;
 billingAddress: string;
 paymentMethod: string;
 adminApprovalRequired: boolean;
 cancellationReason?: string;
 cancelledAt?: string | null;
 createdAt: string;
 updatedAt: string;
 user: {
 id: string;
 name: string | null;
 email: string;
 };
 orderItems: OrderItem[];
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl border border-lawlaw-steel-blue/30 transition-all duration-300 hover:scale-[1.02] hover:border-lawlaw-ocean-teal/50"
 >
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-lawlaw-steel-blue/20 to-lawlaw-aqua-teal/20 flex items-center justify-center shadow-sm text-lawlaw-ocean-teal">
 {icon}
 </div>
 <div className="flex-1">
 <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</p>
 <p className="text-2xl sm:text-3xl font-bold text-lawlaw-ocean-teal mt-1">{value}</p>
 </div>
 </div>
 </motion.div>
 );
}

// Analytics data interface
interface AnalyticsData {
 sales: {
   total: number;
   orders: number;
   averageOrderValue: number;
   byDate: { date: string; amount: number }[];
 };
 products: {
   topSelling: { name: string; quantity: number; revenue: number }[];
 };
 categories: { category: string; revenue: number; orders: number }[];
 orderStatus: { [key: string]: number };
}

export default function AdminPage() {
 const [activeTab, setActiveTab] = useState<TabId>('overview');
 const [stats, setStats] = useState<AdminStats | null>(null);
 const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
 const [orders, setOrders] = useState<Order[]>([]);
 const [loading, setLoading] = useState(false);
 const [showConfirmModal, setShowConfirmModal] = useState(false);
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
 const [showCancelModal, setShowCancelModal] = useState(false);
 const [cancellationReason, setCancellationReason] = useState('');
 const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [showLogoutModal, setShowLogoutModal] = useState(false);
 const [isLoggingOut, setIsLoggingOut] = useState(false);

 useEffect(() => {
 // load overview on mount
 fetchOverview();
 }, []);

 useEffect(() => {
 if (activeTab === 'overview') fetchOverview();
 else if (activeTab === 'orders') fetchOrders();
 else if (activeTab === 'sellerApplications') fetchOverview(); // stats includes pending apps
 // other tabs load on demand if needed
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeTab]);

 // Skeleton loading component
 const SkeletonCard = () => (
 <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 animate-pulse">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-200"></div>
 <div className="flex-1">
 <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
 <div className="h-8 bg-gray-200 rounded w-32"></div>
 </div>
 </div>
 </div>
 );

 const SkeletonOrderCard = () => (
 <div className="bg-gradient-to-r from-gray-50 to-green-50/20 rounded-xl p-4 sm:p-5 border border-gray-200 animate-pulse">
 <div className="flex flex-col gap-3">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1">
 <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
 <div className="h-3 bg-gray-200 rounded w-40"></div>
 </div>
 <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
 </div>
 <div className="flex gap-2">
 <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
 <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 </div>
 );

 // small loading UI
 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 text-gray-900">
 <Toaster position="top-right" />

 {/* Top Navigation Bar */}
 <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
 <div className="max-w-[1600px] mx-auto px-4 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl animate-pulse"></div>
 <div className="hidden sm:block">
 <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
 <div className="h-3 bg-gray-200 rounded w-64 animate-pulse hidden md:block"></div>
 </div>
 </div>
 <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
 </div>
 </div>
 </div>

 <div className="max-w-[1600px] mx-auto px-4 py-4 sm:py-6">
 <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
 {/* Sidebar Skeleton */}
 <aside className="w-full lg:w-72 bg-white rounded-2xl shadow p-4 space-y-2">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
 <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
 ))}
 </aside>

 {/* Main content skeleton */}
 <section className="flex-1 min-w-0 space-y-4 sm:space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
 {[1, 2, 3, 4].map((i) => (
 <SkeletonCard key={i} />
 ))}
 </div>

 <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
 <div className="h-6 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
 <div className="space-y-3">
 {[1, 2, 3].map((i) => (
 <SkeletonOrderCard key={i} />
 ))}
 </div>
 </div>
 </section>
 </div>
 </div>
 </div>
 );
 }

 async function fetchOverview() {
 setLoading(true);
 try {
 // Fetch both stats and analytics data in parallel
 const [statsRes, analyticsRes] = await Promise.all([
 fetch('/api/admin/stats'),
 fetch('/api/admin/analytics?period=monthly')
 ]);

 if (!statsRes.ok) throw new Error('Failed to fetch stats');
 const statsData = await statsRes.json();
 setStats(statsData);

 if (analyticsRes.ok) {
 const analyticsJson = await analyticsRes.json();
 setAnalyticsData(analyticsJson);
 }
 } catch (err) {
 console.error(err);
 toast.error('Failed to load dashboard stats');
 } finally {
 setLoading(false);
 }
 }

 async function fetchOrders() {
 setLoading(true);
 try {
 const res = await fetch('/api/admin/orders');
 if (!res.ok) throw new Error('Failed to fetch orders');
 const data = await res.json();
 setOrders(data);
 } catch (err) {
 console.error(err);
 toast.error('Failed to load orders');
 } finally {
 setLoading(false);
 }
 }

 // Approve/reject seller application
 async function handleApplication(appId: string, status: 'approved' | 'rejected') {
 try {
 const res = await fetch(`/api/admin/seller-applications/${appId}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status }),
 });
 if (!res.ok) {
 const text = await res.text();
 console.error('application patch failed', res.status, text);
 throw new Error('Failed to update application');
 }
 toast.success(`Application ${status}`);
 fetchOverview();
 } catch (err) {
 console.error(err);
 toast.error('Error updating application');
 }
 }

 // Cancel order (admin-initiated)
 async function handleCancelOrder() {
 if (!selectedOrder) return;
 if (!cancellationReason.trim()) {
 toast.error('Please provide a cancellation reason');
 return;
 }

 try {
 const res = await fetch(`/api/admin/orders/${selectedOrder.id}/cancel`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ reason: cancellationReason }),
 });
 if (!res.ok) {
 const err = await res.json().catch(() => ({ error: 'Failed' }));
 throw new Error(err?.error || 'Failed to cancel');
 }
 toast.success('Order cancelled');
 setShowCancelModal(false);
 setSelectedOrder(null);
 setCancellationReason('');
 fetchOrders();
 } catch (err) {
 console.error(err);
 toast.error('Failed to cancel order');
 }
 }

 // Approve or reject cancellation requested by user
 async function handleApproveCancellation(orderId: string, approved: boolean) {
 try {
 const res = await fetch(`/api/admin/orders/${orderId}/approve-cancellation`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ approved }),
 });
 if (!res.ok) {
 const err = await res.json().catch(() => ({ error: 'Failed' }));
 throw new Error(err?.error || 'Failed to update');
 }
 toast.success(approved ? 'Cancellation approved' : 'Cancellation rejected');
 fetchOrders();
 } catch (err) {
 console.error(err);
 toast.error('Failed to process cancellation');
 }
 }

 function toggleExpand(orderId: string) {
 setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
 }

 function openCancelModal(order: Order) {
 setSelectedOrder(order);
 setCancellationReason('');
 setShowCancelModal(true);
 }

 function openConfirmModal(order: Order) {
 setSelectedOrder(order);
 setShowConfirmModal(true);
 }

 // Handle logout
 async function handleLogout() {
 setIsLoggingOut(true);
 try {
 const { signOut } = await import('next-auth/react');
 await signOut({ redirect: true, callbackUrl: '/login' });
 } catch (error) {
 console.error('Logout error:', error);
 toast.error('Failed to logout. Please try again.');
 setIsLoggingOut(false);
 setShowLogoutModal(false);
 }
 }

 // utility to show status color
 function statusClasses(status: string) {
 switch (status) {
 case 'pending': return 'bg-yellow-100 text-yellow-800';
 case 'processing': return 'bg-blue-100 text-blue-800';
 case 'shipped': return 'bg-purple-100 text-purple-800';
 case 'delivered': return 'bg-green-100 text-green-800';
 case 'cancelled': return 'bg-red-100 text-red-800';
 default: return 'bg-gray-100 text-gray-800';
 }
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 text-gray-900 relative">
 {/* Animated background - Lawlaw ocean theme */}
 <div className="fixed inset-0 -z-10 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 right-20 w-96 h-96 bg-lawlaw-aqua-teal/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
 <div className="pulsing-orb absolute bottom-20 left-20 w-80 h-80 bg-lawlaw-steel-blue/10 rounded-full blur-3xl" style={{ animationDelay: '4s' }}></div>
 <div className="floating-orb absolute top-1/2 left-1/2 w-64 h-64 bg-lawlaw-ocean-teal/10 rounded-full blur-3xl" style={{ animationDelay: '7s' }}></div>
 </div>
 <Toaster position="top-right" />

 {/* Logout Confirmation Modal */}
 <AnimatePresence>
 {showLogoutModal && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[100] flex items-center justify-center p-4"
 >
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={() => !isLoggingOut && setShowLogoutModal(false)}
 />

 {/* Modal Content */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4"
 >
 {/* Icon */}
 <div className="flex justify-center mb-6">
 <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
 <ArrowRightOnRectangleIcon className="w-10 h-10 text-white" />
 </div>
 </div>

 {/* Title */}
 <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
 Confirm Logout
 </h2>

 {/* Message */}
 <p className="text-gray-600 text-center mb-6">
 Are you sure you want to logout from the admin dashboard? You will need to sign in again to access admin features.
 </p>

 {/* Buttons */}
 <div className="flex flex-col sm:flex-row gap-3">
 <button
 onClick={() => setShowLogoutModal(false)}
 disabled={isLoggingOut}
 className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Cancel
 </button>
 <button
 onClick={handleLogout}
 disabled={isLoggingOut}
 className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {isLoggingOut ? (
 <>
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 <span>Logging out...</span>
 </>
 ) : (
 <>
 <ArrowRightOnRectangleIcon className="w-5 h-5" />
 <span>Logout</span>
 </>
 )}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Top Navigation Bar */}
 <div className="sticky top-0 z-40 bg-gradient-to-r from-white via-lawlaw-silver/30 to-white backdrop-blur-md border-b border-lawlaw-steel-blue/30 shadow-lg">
 <div className="max-w-[1600px] mx-auto px-4 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <button
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
 aria-label="Toggle sidebar"
 >
 <Bars3Icon className="h-6 w-6 text-lawlaw-ocean-teal" />
 </button>

 <div className="flex items-center gap-2 sm:gap-3">
 <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-lawlaw-steel-blue to-lawlaw-ocean-teal rounded-xl shadow-md flex items-center justify-center overflow-hidden">
 <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
 </div>
 <div className="hidden sm:block">
 <h1 className="text-xl sm:text-2xl font-bold lawlaw-text-gradient">Admin Dashboard</h1>
 <p className="text-xs text-gray-600 hidden md:block">Manage users, products and orders</p>
 </div>
 <h1 className="sm:hidden text-lg font-bold text-lawlaw-ocean-teal">Admin</h1>
 </div>
 </div>

 <div className="flex items-center gap-2 sm:gap-4">
 <button
 onClick={() => setShowLogoutModal(true)}
 className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-md"
 >
 <ArrowRightOnRectangleIcon className="h-4 w-4" />
 <span>Logout</span>
 </button>
 <button
 onClick={() => setShowLogoutModal(true)}
 className="sm:hidden p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
 title="Logout"
 >
 <ArrowRightOnRectangleIcon className="h-5 w-5" />
 </button>
 <div className="rounded-full bg-gradient-to-br from-lawlaw-steel-blue to-lawlaw-ocean-teal p-2.5 shadow-md text-white">
 <UsersIcon className="w-5 h-5" />
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-[1600px] mx-auto px-4 py-4 sm:py-6">
 <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
 {/* Sidebar - Mobile Overlay / Desktop Fixed */}
 <aside className={`
 fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] lg:h-auto
 w-64 lg:w-72 bg-white
 rounded-none lg:rounded-2xl shadow-xl lg:shadow-lg border-r lg:border border-gray-200
 transition-transform duration-300 ease-in-out z-30
 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
 lg:flex-shrink-0
 `}>
 <div className="p-4 h-full overflow-y-auto">
 {/* Mobile close button */}
 <div className="lg:hidden flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
 <h2 className="font-semibold text-lawlaw-ocean-teal">Navigation</h2>
 <button
 onClick={() => setSidebarOpen(false)}
 className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
 aria-label="Close menu"
 >
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <nav className="space-y-2">
 {([
 { id: 'overview', label: 'Overview', icon: <ChartPieIcon className="w-6 h-6" /> },
 { id: 'users', label: 'Users', icon: <UserGroupIcon className="w-6 h-6" /> },
 { id: 'products', label: 'Products', icon: <CubeIcon className="w-6 h-6" /> },
 { id: 'orders', label: 'Orders', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
 { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="w-6 h-6" /> },
 { id: 'sellerApplications', label: 'Seller Apps', icon: <DocumentTextIcon className="w-6 h-6" /> },
 { id: 'messages', label: 'Messages', icon: <ChatBubbleLeftRightIcon className="w-6 h-6" /> },
 ] as { id: TabId; label: string; icon: React.ReactNode }[]).map((t) => (
 <button
 key={t.id}
 onClick={() => {
 setActiveTab(t.id);
 setSidebarOpen(false); // Close mobile menu on selection
 }}
 className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
 activeTab === t.id
 ? 'bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white shadow-lg transform scale-[1.02]'
 : 'text-gray-700 hover:bg-lawlaw-silver/30 hover:text-lawlaw-ocean-teal'
 }`}
 >
 <div className="flex-shrink-0">{t.icon}</div>
 <span className="font-medium flex-1">{t.label}</span>
 {activeTab === t.id && <span className="w-2 h-2 rounded-full bg-white"></span>}
 </button>
 ))}
 </nav>

 <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
 <button
 onClick={() => {
 setActiveTab('orders');
 setSidebarOpen(false);
 }}
 className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-lawlaw-aqua-teal/20 to-lawlaw-deep-blue/10 text-lawlaw-aqua-teal hover:from-lawlaw-aqua-teal/30 hover:to-lawlaw-deep-blue/20 transition-all font-medium border border-lawlaw-aqua-teal/30 flex items-center gap-3"
 >
 <ExclamationTriangleIcon className="w-5 h-5" />
 <span>Manage Orders</span>
 </button>
 <button
 onClick={() => {
 setSidebarOpen(false);
 setShowLogoutModal(true);
 }}
 className="w-full text-left px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium border border-red-200 flex items-center gap-3"
 >
 <ArrowRightOnRectangleIcon className="w-5 h-5" />
 <span>Logout</span>
 </button>
 </div>
 </div>
 </aside>

 {/* Overlay for mobile */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 bg-black/30 z-20 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}

 {/* Main content */}
 <section className="flex-1 min-w-0">
 {/* OVERVIEW */}
 {activeTab === 'overview' && stats && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
 <StatCard label="Total Users" value={stats.totalUsers} icon={<UserGroupIcon className="w-8 h-8 sm:w-10 sm:h-10" />} />
 <StatCard label="Total Products" value={stats.totalProducts} icon={<CubeIcon className="w-8 h-8 sm:w-10 sm:h-10" />} />
 <StatCard label="Total Orders" value={stats.totalOrders} icon={<ClipboardDocumentListIcon className="w-8 h-8 sm:w-10 sm:h-10" />} />
 <StatCard label="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} icon={<CurrencyDollarIcon className="w-8 h-8 sm:w-10 sm:h-10" />} />
 </div>

 {/* Charts Section */}
 {analyticsData && (
 <OverviewCharts
   salesData={analyticsData.sales?.byDate || []}
   topProducts={analyticsData.products?.topSelling || []}
   categoryData={analyticsData.categories || []}
   orderStatus={analyticsData.orderStatus || {}}
   totalSales={analyticsData.sales?.total || 0}
   totalOrders={analyticsData.sales?.orders || 0}
   averageOrderValue={analyticsData.sales?.averageOrderValue || 0}
 />
 )}

 <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-lawlaw-steel-blue/30">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg sm:text-xl font-semibold text-lawlaw-ocean-teal flex items-center gap-2">
 <DocumentTextIcon className="w-6 h-6" />
 <span>Recent Seller Applications</span>
 </h3>
 {stats.pendingSellerApplications.length > 0 && (
 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
 {stats.pendingSellerApplications.length} pending
 </span>
 )}
 </div>
 {stats.pendingSellerApplications.length ? (
 <div className="space-y-3">
 {stats.pendingSellerApplications.map((app) => (
 <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-lawlaw-silver/30 to-lawlaw-steel-blue/10 rounded-xl border border-lawlaw-steel-blue/30 gap-3 hover:border-lawlaw-ocean-teal/50 transition-all">
 <div className="flex-1">
 <p className="font-semibold text-gray-900">{app.businessName}</p>
 <p className="text-sm text-gray-600 mt-1">{app.businessType} • {app.user.name || app.user.email}</p>
 <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
 </div>
 <div className="flex gap-2 sm:flex-shrink-0">
 <button
 onClick={() => handleApplication(app.id, 'approved')}
 className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
 >
 <CheckCircleIcon className="w-5 h-5" />
 Approve
 </button>
 <button
 onClick={() => handleApplication(app.id, 'rejected')}
 className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
 >
 <XCircleIcon className="w-5 h-5" />
 Reject
 </button>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8">
 <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-2" />
 <p className="text-sm text-gray-500">No pending applications</p>
 </div>
 )}
 </div>
 </motion.div>
 )}

 {/* ORDERS */}
 {activeTab === 'orders' && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
 <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-lawlaw-steel-blue/30">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
 <h3 className="text-xl sm:text-2xl font-semibold text-lawlaw-ocean-teal flex items-center gap-2">
 <ClipboardDocumentListIcon className="w-6 h-6" />
 <span>Order Management</span>
 </h3>
 <button
 onClick={() => fetchOrders()}
 className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-lawlaw-ocean-teal transition-all font-medium text-sm flex items-center gap-2"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 <span>Refresh</span>
 </button>
 </div>

 {orders.length === 0 ? (
 <div className="text-center py-12">
 <ShoppingCartIcon className="w-20 h-20 text-gray-300 mx-auto mb-3" />
 <p className="text-gray-500">No orders found</p>
 </div>
 ) : (
 <div className="space-y-4">
 {orders.map((order) => (
 <div key={order.id} className="bg-gradient-to-r from-lawlaw-silver/30 to-lawlaw-steel-blue/10 rounded-xl p-4 sm:p-5 border border-lawlaw-steel-blue/30 hover:border-lawlaw-ocean-teal/50 transition-all">
 <div className="flex flex-col gap-3">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2 mb-2">
 <h4 className="font-bold text-lawlaw-ocean-teal text-lg">#{order.id.slice(-8)}</h4>
 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses(order.status)}`}>
 {order.status.toUpperCase()}
 </span>
 {order.adminApprovalRequired && (
 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 flex items-center gap-1">
 <ExclamationTriangleIcon className="w-3 h-3" />
 APPROVAL REQUIRED
 </span>
 )}
 </div>
 <p className="text-sm text-gray-600 truncate">
 <span className="font-medium">{order.user.name || order.user.email}</span>
 </p>
 <p className="text-xs text-gray-500 mt-1">
 {new Date(order.createdAt).toLocaleString()}
 </p>
 <p className="text-sm font-semibold text-lawlaw-ocean-teal mt-2">
 Total: ₱{order.totalAmount.toFixed(2)}
 </p>
 </div>

 <button
 onClick={() => toggleExpand(order.id)}
 className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-lawlaw-ocean-teal hover:text-white transition-all flex-shrink-0"
 aria-expanded={!!expandedOrders[order.id]}
 title={expandedOrders[order.id] ? "Collapse" : "Expand"}
 >
 {expandedOrders[order.id] ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
 </button>
 </div>

 <div className="flex flex-col sm:flex-row gap-2">
 {order.adminApprovalRequired ? (
 <>
 <button
 onClick={() => handleApproveCancellation(order.id, true)}
 className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
 >
 <CheckCircleIcon className="w-4 h-4" />
 Approve Cancel
 </button>
 <button
 onClick={() => handleApproveCancellation(order.id, false)}
 className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-2"
 >
 <XCircleIcon className="w-4 h-4" />
 Reject Cancel
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => openCancelModal(order)}
 className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-2"
 >
 <TrashIcon className="w-4 h-4" />
 <span>Cancel Order</span>
 </button>
 <button
 onClick={() => openConfirmModal(order)}
 className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-200 font-medium hover:bg-lawlaw-ocean-teal hover:text-white hover:border-lawlaw-ocean-teal transition-all text-sm flex items-center justify-center gap-2"
 >
 <CheckCircleIcon className="w-4 h-4" />
 <span>Mark Processed</span>
 </button>
 </>
 )}
 </div>
 </div>

 <AnimatePresence>
 {expandedOrders[order.id] && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
 >
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="space-y-3">
 <h5 className="font-semibold text-gray-900 flex items-center gap-2">
 <ClipboardDocumentListIcon className="w-5 h-5 text-lawlaw-ocean-teal" />
 <span>Order Details</span>
 </h5>
 <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shipping Address</p>
 <p className="text-sm text-gray-900 font-medium">{order.shippingAddress}</p>
 </div>
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billing Address</p>
 <p className="text-sm text-gray-900 font-medium">{order.billingAddress}</p>
 </div>
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Method</p>
 <p className="text-sm text-gray-900 font-medium">{order.paymentMethod}</p>
 </div>
 <div className="pt-3 border-t">
 <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
 <p className="text-lg font-bold text-lawlaw-ocean-teal">₱{order.totalAmount.toFixed(2)}</p>
 </div>
 {order.cancellationReason && (
 <div className="pt-3 border-t border-red-200">
 <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Cancellation Reason</p>
 <p className="text-sm text-red-700 font-medium">{order.cancellationReason}</p>
 </div>
 )}
 {order.cancelledAt && (
 <div>
 <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Cancelled At</p>
 <p className="text-sm text-red-700 font-medium">{new Date(order.cancelledAt).toLocaleString()}</p>
 </div>
 )}
 </div>
 </div>

 <div className="space-y-3">
 <h5 className="font-semibold text-gray-900 flex items-center gap-2">
 <CubeIcon className="w-5 h-5 text-lawlaw-ocean-teal" />
 <span>Order Items</span>
 </h5>
 <div className="space-y-2">
 {order.orderItems.map(item => (
 <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-lawlaw-ocean-teal/50 transition-colors">
 <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-green-50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
 {item.product.image ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
 ) : (
 <div className="text-xl font-bold text-lawlaw-ocean-teal">{item.product.name.slice(0,1)}</div>
 )}
 </div>

 <div className="flex-1 min-w-0">
 <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
 <p className="text-sm text-gray-600 mt-1">
 Qty: <span className="font-medium">{item.quantity}</span> × ₱{item.price.toFixed(2)}
 </p>
 <p className="text-sm font-semibold text-lawlaw-ocean-teal mt-1">
 Subtotal: ₱{(item.quantity * item.price).toFixed(2)}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 )}

 {/* SELLER APPLICATIONS */}
 {activeTab === 'sellerApplications' && stats && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
 <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-lawlaw-steel-blue/30">
 <div className="flex items-center justify-between mb-4 sm:mb-6">
 <h3 className="text-xl sm:text-2xl font-semibold text-lawlaw-ocean-teal flex items-center gap-2">
 <DocumentTextIcon className="w-6 h-6" />
 <span>Seller Applications</span>
 </h3>
 {stats.pendingSellerApplications.length > 0 && (
 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
 {stats.pendingSellerApplications.length}
 </span>
 )}
 </div>
 {stats.pendingSellerApplications.length === 0 ? (
 <div className="text-center py-12">
 <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-3" />
 <p className="text-gray-500">No pending applications</p>
 </div>
 ) : (
 <div className="space-y-3">
 {stats.pendingSellerApplications.map(app => (
 <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-yellow-50/30 rounded-xl border border-gray-100 gap-3 hover:border-lawlaw-ocean-teal/50 transition-all">
 <div className="flex-1">
 <p className="font-bold text-gray-900 text-lg">{app.businessName}</p>
 <p className="text-sm text-gray-600 mt-1">{app.businessType}</p>
 <p className="text-sm text-gray-600">Owner: {app.user.name || app.user.email}</p>
 <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
 </div>

 <div className="flex gap-2 sm:flex-shrink-0">
 <button
 onClick={() => handleApplication(app.id, 'approved')}
 className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
 >
 <CheckCircleIcon className="h-5 w-5" />
 <span>Approve</span>
 </button>
 <button
 onClick={() => handleApplication(app.id, 'rejected')}
 className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
 >
 <XCircleIcon className="h-5 w-5" />
 <span>Reject</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 )}

 {activeTab === 'users' && (
 <UsersTab />
 )}

 {activeTab === 'products' && (
 <ProductsManager />
 )}

 {activeTab === 'analytics' && (
 <AnalyticsTab />
 )}

 {activeTab === 'messages' && (
 <MessagesTab />
 )}
 </section>
 </div>
 </div>

 {/* Cancel modal */}
 <AnimatePresence>
 {showCancelModal && selectedOrder && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-lg">
 <h3 className="text-lg font-semibold mb-2">Cancel Order #{selectedOrder.id.slice(-8)}</h3>
 <p className="text-sm text-gray-600 mb-4">Provide a reason for cancelling this order (this will be recorded).</p>
 <textarea
 rows={4}
 value={cancellationReason}
 onChange={(e) => setCancellationReason(e.target.value)}
 className="w-full p-3 border border-gray-200 rounded-lg mb-4"
 placeholder="Reason..."
 />
 <div className="flex gap-3 justify-end">
 <button onClick={() => { setShowCancelModal(false); setSelectedOrder(null); setCancellationReason(''); }} className="px-4 py-2 rounded-lg border">Close</button>
 <button onClick={handleCancelOrder} className="px-4 py-2 rounded-lg bg-red-600 text-white">Confirm Cancel</button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Confirm modal (simple example for processing an order) */}
 <AnimatePresence>
 {showConfirmModal && selectedOrder && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg">
 <h3 className="text-lg font-semibold mb-2">Mark order as processed?</h3>
 <p className="text-sm text-gray-600 mb-4">This will change the order status to processing.</p>
 <div className="flex gap-3 justify-end">
 <button onClick={() => { setShowConfirmModal(false); setSelectedOrder(null); }} className="px-4 py-2 rounded-lg border">Cancel</button>
 <button
 onClick={async () => {
 if (!selectedOrder) return;
 try {
 const res = await fetch(`/api/admin/orders/${selectedOrder.id}/mark-processing`, { method: 'PATCH' });
 if (!res.ok) throw new Error('Failed');
 toast.success('Order marked processing');
 setShowConfirmModal(false);
 setSelectedOrder(null);
 fetchOrders();
 } catch (err) {
 console.error(err);
 toast.error('Failed to update order');
 }
 }}
 className="px-4 py-2 rounded-lg bg-lawlaw-ocean-teal text-white"
 >
 Confirm
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}


/* ---------------- Helper components ---------------- */

function ProductsManager() {
 const [products, setProducts] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);
 const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
 const [categoryInput, setCategoryInput] = useState<string>('');
 const [refreshKey, setRefreshKey] = useState(0);
 const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards'); // default to cards for mobile

 useEffect(() => {
 async function fetchProducts() {
 setLoading(true);
 try {
 const res = await fetch('/api/admin/products');
 if (!res.ok) throw new Error('Failed to fetch products');
 const data = await res.json();
 setProducts(data);
 } catch (err) {
 console.error(err);
 toast.error('Failed to load products');
 } finally {
 setLoading(false);
 }
 }
 fetchProducts();
 }, [refreshKey]);

 async function toggleFeatured(id: string) {
 try {
 const res = await fetch(`/api/admin/products/${id}/feature`, {
 method: 'PATCH',
 credentials: 'include',
 });
 if (!res.ok) throw new Error('Failed to toggle featured');
 toast.success('Toggled featured state');
 setRefreshKey(prev => prev + 1);
 } catch (err) {
 console.error(err);
 toast.error('Failed to toggle featured');
 }
 }

 async function updateCategory(id: string, category: string) {
 try {
 const res = await fetch(`/api/admin/products/${id}/category`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ category }),
 credentials: 'include',
 });
 if (!res.ok) throw new Error('Failed to update category');
 toast.success('Category updated');
 setEditingCategoryId(null);
 setRefreshKey(prev => prev + 1);
 } catch (err) {
 console.error(err);
 toast.error('Failed to update category');
 }
 }

 async function removeProduct(id: string) {
 try {
 const res = await fetch(`/api/admin/products/${id}/remove`, {
 method: 'PATCH',
 credentials: 'include',
 });
 if (!res.ok) throw new Error('Failed to remove product');
 toast.success('Product removed');
 setRefreshKey(prev => prev + 1);
 } catch (err) {
 console.error(err);
 toast.error('Failed to remove product');
 }
 }

 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
 <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-lawlaw-steel-blue/30">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-gradient-to-br from-lawlaw-steel-blue/20 to-lawlaw-aqua-teal/20 rounded-xl">
 <CubeIcon className="w-6 h-6 text-lawlaw-ocean-teal" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-lawlaw-ocean-teal">Products Management</h3>
 <p className="text-sm text-gray-500">{products.length} products total</p>
 </div>
 </div>
 <div className="hidden lg:flex gap-2">
 <button
 onClick={() => setViewMode('cards')}
 className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${
 viewMode === 'cards'
 ? 'bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white shadow-md'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 Cards
 </button>
 <button
 onClick={() => setViewMode('table')}
 className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${
 viewMode === 'table'
 ? 'bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white shadow-md'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 Table
 </button>
 </div>
 </div>

 {loading ? (
 <div className="text-center py-12">
 <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-lawlaw-ocean-teal mx-auto mb-3"></div>
 <p className="text-gray-500">Loading products...</p>
 </div>
 ) : products.length === 0 ? (
 <div className="text-center py-12">
 <CubeIcon className="w-20 h-20 text-gray-300 mx-auto mb-3" />
 <p className="text-gray-500">No products found</p>
 </div>
 ) : (
 <>
 {/* Mobile/Tablet Card View - Always shown on mobile, optional on desktop */}
 <div className={`${viewMode === 'table' ? 'hidden lg:hidden' : 'block lg:grid'} grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`}>
 {products.map((prod, index) => (
 <motion.div
 key={prod.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl border border-gray-200 overflow-hidden hover:border-lawlaw-ocean-teal/50 hover:shadow-lg transition-all"
 >
 <div className="relative h-48 bg-gray-100">
 {prod.image ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-gray-400">
 <CubeIcon className="w-16 h-16" />
 </div>
 )}
 {prod.featured && (
 <div className="absolute top-2 right-2">
 <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center gap-1 shadow-md">
 <StarIcon className="w-3 h-3" />
 FEATURED
 </span>
 </div>
 )}
 </div>
 <div className="p-4 space-y-3">
 <h4 className="font-bold text-gray-900 text-base truncate">{prod.name}</h4>
 <div className="flex items-center justify-between text-sm">
 <span className="text-gray-600">Price:</span>
 <span className="font-bold text-lawlaw-ocean-teal text-base">₱{prod.price.toFixed(2)}</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-gray-600">Stock:</span>
 <span className="font-semibold text-gray-900">{prod.stock}</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-gray-600">Category:</span>
 {editingCategoryId === prod.id ? (
 <div className="flex gap-1">
 <input
 type="text"
 value={categoryInput}
 onChange={(e) => setCategoryInput(e.target.value)}
 className="border bg-white text-gray-900 rounded px-2 py-1 text-xs w-20"
 />
 <button
 onClick={() => updateCategory(prod.id, categoryInput)}
 className="bg-gradient-to-r from-primary-green to-green-600 text-white rounded px-2 text-xs flex items-center justify-center hover:shadow-md transition-shadow"
 >
 <CheckCircleIcon className="w-4 h-4" />
 </button>
 <button
 onClick={() => setEditingCategoryId(null)}
 className="bg-gray-400 text-white rounded px-2 text-xs flex items-center justify-center hover:bg-gray-500 transition-colors"
 >
 <XCircleIcon className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <span
 onClick={() => {
 setEditingCategoryId(prod.id);
 setCategoryInput(prod.category || '');
 }}
 className="cursor-pointer hover:underline font-medium text-lawlaw-ocean-teal"
 >
 {prod.category || 'N/A'}
 </span>
 )}
 </div>
 <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
 <span className="text-gray-600">Featured:</span>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={prod.featured || false}
 onChange={() => toggleFeatured(prod.id)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lawlaw-aqua-teal/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-green peer-checked:to-green-600"></div>
 </label>
 </div>
 <button
 onClick={() => {
 if (confirm('Are you sure you want to remove this product?')) {
 removeProduct(prod.id);
 }
 }}
 className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
 >
 <TrashIcon className="w-5 h-5" />
 <span>Remove Product</span>
 </button>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Desktop Table View - Only shown when table mode is selected on desktop */}
 {viewMode === 'table' && (
 <div className="hidden lg:block overflow-x-auto">
 <table className="min-w-full bg-white rounded-lg">
 <thead className="bg-gradient-to-r from-gray-50 to-green-50/30">
 <tr>
 <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase">Image</th>
 <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
 <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
 <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
 <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
 <th className="py-3 px-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-700 uppercase">Featured</th>
 <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
 </tr>
 </thead>
 <tbody>
 {products.map((prod, index) => (
 <motion.tr
 key={prod.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="hover:bg-gradient-to-r hover:from-soft-green/10 hover:to-banana-leaf/10 transition-all"
 >
 <td className="p-3 border-b border-gray-100">
 {prod.image ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover rounded-lg" />
 ) : (
 <div className="h-12 w-12 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400">
 <CubeIcon className="w-6 h-6" />
 </div>
 )}
 </td>
 <td className="p-3 border-b border-gray-100 font-medium text-gray-900">{prod.name}</td>
 <td className="p-3 border-b border-gray-100">
 {editingCategoryId === prod.id ? (
 <div className="flex gap-1">
 <input
 type="text"
 value={categoryInput}
 onChange={(e) => setCategoryInput(e.target.value)}
 className="border bg-white text-gray-900 rounded px-2 py-1 text-sm w-24"
 />
 <button
 onClick={() => updateCategory(prod.id, categoryInput)}
 className="bg-gradient-to-r from-primary-green to-green-600 text-white rounded px-2 text-xs hover:shadow-md transition-shadow"
 >
 Save
 </button>
 <button
 onClick={() => setEditingCategoryId(null)}
 className="bg-gray-400 text-white rounded px-2 text-xs hover:bg-gray-500 transition-colors"
 >
 Cancel
 </button>
 </div>
 ) : (
 <span
 onClick={() => {
 setEditingCategoryId(prod.id);
 setCategoryInput(prod.category || '');
 }}
 className="cursor-pointer hover:underline text-lawlaw-ocean-teal"
 >
 {prod.category || 'N/A'}
 </span>
 )}
 </td>
 <td className="p-3 border-b border-gray-100 font-semibold text-lawlaw-ocean-teal">₱{prod.price.toFixed(2)}</td>
 <td className="p-3 border-b border-gray-100 text-gray-900">{prod.stock}</td>
 <td className="p-3 border-b border-gray-100 text-center">
 <input
 type="checkbox"
 checked={prod.featured || false}
 onChange={() => toggleFeatured(prod.id)}
 className="w-4 h-4 text-lawlaw-ocean-teal rounded focus:ring-lawlaw-aqua-teal cursor-pointer"
 />
 </td>
 <td className="p-3 border-b border-gray-100">
 <button
 onClick={() => {
 if (confirm('Are you sure you want to remove this product?')) {
 removeProduct(prod.id);
 }
 }}
 className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-1"
 >
 <TrashIcon className="w-4 h-4" />
 Remove
 </button>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </>
 )}
 </div>
 </motion.div>
 );
}

// Analytics Tab Component
function AnalyticsTab() {
 const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
 const [analytics, setAnalytics] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchAnalytics();
 }, [period]);

 const fetchAnalytics = async () => {
 setLoading(true);
 try {
 const response = await fetch(`/api/admin/analytics?period=${period}`);
 if (response.ok) {
 const data = await response.json();
 setAnalytics(data);
 } else {
 toast.error('Failed to load analytics');
 }
 } catch (error) {
 console.error('Error fetching analytics:', error);
 toast.error('Error loading analytics');
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <motion.div
 animate={{
 rotate: 360,
 scale: [1, 1.2, 1]
 }}
 transition={{
 duration: 1.5,
 repeat: Infinity,
 ease: "easeInOut"
 }}
 className="rounded-full h-12 w-12 border-b-4 border-lawlaw-ocean-teal"
 ></motion.div>
 </div>
 );
 }

 if (!analytics) {
 return (
 <div className="text-center py-12">
 <p className="text-sm sm:text-base text-gray-600">No analytics data available</p>
 </div>
 );
 }

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.5 }}
 className="space-y-4 sm:space-y-6"
 >
 {/* Period Selector - Mobile Optimized */}
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
 <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-lawlaw-ocean-teal flex items-center gap-2">
 <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
 <span>Analytics Dashboard</span>
 </h3>
 <div className="flex gap-1.5 sm:gap-2">
 {(['daily', 'weekly', 'monthly'] as const).map((p) => (
 <motion.button
 key={p}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setPeriod(p)}
 className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
 period === p
 ? 'bg-lawlaw-ocean-teal text-white shadow-md'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 {p.charAt(0).toUpperCase() + p.slice(1)}
 </motion.button>
 ))}
 </div>
 </div>
 </motion.div>

 {/* Key Metrics Cards - Mobile Responsive with Animations */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
 whileHover={{ scale: 1.03, y: -5 }}
 className="bg-gradient-to-br from-lawlaw-steel-blue via-lawlaw-aqua-teal to-lawlaw-ocean-teal rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs sm:text-sm font-medium opacity-90">Total Sales</span>
 <motion.div
 animate={{ rotate: [0, 10, -10, 0] }}
 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
 className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm"
 >
 <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
 </motion.div>
 </div>
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.3 }}
 className="text-2xl sm:text-3xl font-bold"
 >
 ₱{analytics.sales.total.toFixed(2)}
 </motion.div>
 <div className="text-xs sm:text-sm opacity-75 mt-2 flex items-center gap-1">
 <ClipboardDocumentListIcon className="w-3 h-3 sm:w-4 sm:h-4" />
 {analytics.sales.orders} orders
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
 whileHover={{ scale: 1.03, y: -5 }}
 className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs sm:text-sm font-medium opacity-90">Avg Order Value</span>
 <motion.div
 animate={{ y: [0, -5, 0] }}
 transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
 className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm"
 >
 <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
 </motion.div>
 </div>
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.4 }}
 className="text-2xl sm:text-3xl font-bold"
 >
 ₱{analytics.sales.averageOrderValue.toFixed(2)}
 </motion.div>
 <div className="text-xs sm:text-sm opacity-75 mt-2">Per transaction</div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
 whileHover={{ scale: 1.03, y: -5 }}
 className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs sm:text-sm font-medium opacity-90">New Users</span>
 <motion.div
 animate={{ scale: [1, 1.2, 1] }}
 transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
 className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm"
 >
 <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
 </motion.div>
 </div>
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.5 }}
 className="text-2xl sm:text-3xl font-bold"
 >
 {analytics.users.new}
 </motion.div>
 <div className="text-xs sm:text-sm opacity-75 mt-2 flex items-center gap-1">
 <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4" />
 Total: {analytics.users.total}
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
 whileHover={{ scale: 1.03, y: -5 }}
 className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs sm:text-sm font-medium opacity-90">Conversion Rate</span>
 <motion.div
 animate={{ rotate: [0, 360] }}
 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
 className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm"
 >
 <ReceiptPercentIcon className="w-5 h-5 sm:w-6 sm:h-6" />
 </motion.div>
 </div>
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.6 }}
 className="text-2xl sm:text-3xl font-bold"
 >
 {analytics.conversion.cartConversionRate.toFixed(1)}%
 </motion.div>
 <div className="text-xs sm:text-sm opacity-75 mt-2">Cart to order</div>
 </motion.div>
 </div>

 {/* Sales Performance Chart - Mobile Optimized with Animations */}
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 Sales Performance
 </h4>
 <div className="space-y-2 sm:space-y-3">
 {analytics.sales.byDate.map((item: any, index: number) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.6 + index * 0.1 }}
 className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
 >
 <div className="text-xs sm:text-sm text-gray-600 sm:w-24">{new Date(item.date).toLocaleDateString()}</div>
 <div className="flex-1">
 <div className="bg-gray-200 rounded-full h-6 sm:h-8 overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{
 width: `${Math.min(100, (item.amount / Math.max(...analytics.sales.byDate.map((d: any) => d.amount))) * 100)}%`
 }}
 transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
 className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-end px-2 sm:px-3 text-white text-xs sm:text-sm font-medium"
 >
 ₱{item.amount.toFixed(2)}
 </motion.div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>

 {/* Top Products and Sellers - Mobile Responsive with Animations */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
 {/* Top Selling Products */}
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.6 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 Top Selling Products
 </h4>
 <div className="space-y-2 sm:space-y-3">
 {analytics.products.topSelling.slice(0, 5).map((product: any, index: number) => (
 <motion.div
 key={product.productId}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.7 + index * 0.1 }}
 whileHover={{ scale: 1.02, x: 5 }}
 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-lg hover:shadow-md transition-shadow"
 >
 <motion.div
 whileHover={{ rotate: 360 }}
 transition={{ duration: 0.5 }}
 className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-lawlaw-ocean-teal rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md"
 >
 {index + 1}
 </motion.div>
 <div className="flex-1 min-w-0">
 <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</div>
 <div className="text-[10px] sm:text-xs text-gray-500">
 {product.quantity} sold · ₱{product.revenue.toFixed(2)}
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>

 {/* Top Sellers */}
 <motion.div
 initial={{ opacity: 0, x: 30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.6 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 Top Performing Sellers
 </h4>
 <div className="space-y-2 sm:space-y-3">
 {analytics.sellers.topPerformers.slice(0, 5).map((seller: any, index: number) => (
 <motion.div
 key={seller.sellerId}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.7 + index * 0.1 }}
 whileHover={{ scale: 1.02, x: -5 }}
 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-shadow"
 >
 <motion.div
 whileHover={{ rotate: 360 }}
 transition={{ duration: 0.5 }}
 className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md"
 >
 {index + 1}
 </motion.div>
 <div className="flex-1 min-w-0">
 <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{seller.name}</div>
 <div className="text-[10px] sm:text-xs text-gray-500">
 {seller.orders} orders · ₱{seller.revenue.toFixed(2)}
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>

 {/* Abandoned Cart & Category Performance - Mobile Responsive with Animations */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
 {/* Abandoned Cart Statistics */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 Abandoned Cart Insights
 </h4>
 <div className="space-y-3 sm:space-y-4">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.9 }}
 whileHover={{ scale: 1.02 }}
 className="flex justify-between items-center p-2.5 sm:p-3 bg-red-50 rounded-lg"
 >
 <span className="text-xs sm:text-sm text-gray-700">Abandoned Carts</span>
 <motion.span
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1, type: "spring" }}
 className="text-base sm:text-lg font-bold text-red-600"
 >
 {analytics.carts.abandoned}
 </motion.span>
 </motion.div>
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 1 }}
 whileHover={{ scale: 1.02 }}
 className="flex justify-between items-center p-2.5 sm:p-3 bg-orange-50 rounded-lg"
 >
 <span className="text-xs sm:text-sm text-gray-700">Abandonment Rate</span>
 <motion.span
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1.1, type: "spring" }}
 className="text-base sm:text-lg font-bold text-orange-600"
 >
 {analytics.carts.abandonedRate.toFixed(1)}%
 </motion.span>
 </motion.div>
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 1.1 }}
 whileHover={{ scale: 1.02 }}
 className="flex justify-between items-center p-2.5 sm:p-3 bg-purple-50 rounded-lg"
 >
 <span className="text-xs sm:text-sm text-gray-700">Potential Revenue Lost</span>
 <motion.span
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1.2, type: "spring" }}
 className="text-base sm:text-lg font-bold text-purple-600"
 >
 ₱{analytics.carts.abandonedValue.toFixed(2)}
 </motion.span>
 </motion.div>
 </div>
 </motion.div>

 {/* Category Performance */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 Category Performance
 </h4>
 <div className="space-y-2 sm:space-y-3">
 {analytics.categories.map((category: any, index: number) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.9 + index * 0.1 }}
 className="space-y-1"
 >
 <div className="flex justify-between text-xs sm:text-sm">
 <span className="text-gray-700 capitalize">{category.category}</span>
 <span className="text-gray-900 font-medium">₱{category.revenue.toFixed(2)}</span>
 </div>
 <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{
 width: `${Math.min(100, (category.revenue / Math.max(...analytics.categories.map((c: any) => c.revenue))) * 100)}%`
 }}
 transition={{ duration: 1, delay: 1 + index * 0.1, ease: "easeOut" }}
 className="bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-deep-blue h-full"
 />
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>

 {/* Order Status Distribution - Mobile Responsive with Animations */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <ClipboardDocumentListIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 Order Status Distribution
 </h4>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
 {Object.entries(analytics.orderStatus).map(([status, count]: [string, any], index: number) => (
 <motion.div
 key={status}
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 1.1 + index * 0.1, type: "spring", stiffness: 150 }}
 whileHover={{ scale: 1.1, y: -5 }}
 className="text-center p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-lg hover:shadow-md transition-shadow"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
 className="text-xl sm:text-2xl font-bold text-lawlaw-ocean-teal"
 >
 {count}
 </motion.div>
 <div className="text-[10px] sm:text-xs text-gray-600 mt-1 capitalize">{status}</div>
 </motion.div>
 ))}
 </div>
 </motion.div>

 {/* User Growth Trend - Mobile Responsive with Animations */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1.2 }}
 className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100"
 >
 <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
 <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-lawlaw-ocean-teal" />
 User Growth Trends
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 1.3, type: "spring" }}
 whileHover={{ scale: 1.05 }}
 className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg hover:shadow-md transition-shadow"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1.4, type: "spring" }}
 className="text-xl sm:text-2xl font-bold text-blue-600"
 >
 {analytics.users.buyers}
 </motion.div>
 <div className="text-xs sm:text-sm text-gray-600 mt-1">New Buyers</div>
 </motion.div>
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 1.4, type: "spring" }}
 whileHover={{ scale: 1.05 }}
 className="text-center p-3 sm:p-4 bg-green-50 rounded-lg hover:shadow-md transition-shadow"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1.5, type: "spring" }}
 className="text-xl sm:text-2xl font-bold text-green-600"
 >
 {analytics.users.sellers}
 </motion.div>
 <div className="text-xs sm:text-sm text-gray-600 mt-1">New Sellers</div>
 </motion.div>
 <motion.div
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 1.5, type: "spring" }}
 whileHover={{ scale: 1.05 }}
 className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg hover:shadow-md transition-shadow"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 1.6, type: "spring" }}
 className="text-xl sm:text-2xl font-bold text-purple-600"
 >
 {analytics.users.total}
 </motion.div>
 <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Users</div>
 </motion.div>
 </div>
 <div className="space-y-2">
 {analytics.users.growthByDate.map((item: any, index: number) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 1.6 + index * 0.1 }}
 className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
 >
 <div className="text-xs sm:text-sm text-gray-600 sm:w-24">{new Date(item.date).toLocaleDateString()}</div>
 <div className="flex-1">
 <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{
 width: `${Math.min(100, (item.count / Math.max(...analytics.users.growthByDate.map((d: any) => d.count))) * 100)}%`
 }}
 transition={{ duration: 1, delay: 1.7 + index * 0.1, ease: "easeOut" }}
 className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end px-2 text-white text-xs font-medium"
 >
 +{item.count}
 </motion.div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </motion.div>
 );
}

// Messages Tab Component (Oversight)
function MessagesTab() {
 const [conversations, setConversations] = useState<any[]>([]);
 const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
 const [messages, setMessages] = useState<any[]>([]);

 useEffect(() => {
 fetchConversations();
 }, []);

 useEffect(() => {
 if (selectedConversation) {
 fetchMessages(selectedConversation);
 }
 }, [selectedConversation]);

 const fetchConversations = async () => {
 try {
 const res = await fetch('/api/admin/messages');
 if (res.ok) {
 const data = await res.json();
 setConversations(data);
 }
 } catch (error) {
 console.error('Error fetching conversations:', error);
 }
 };

 const fetchMessages = async (conversationId: string) => {
 try {
 const res = await fetch(`/api/admin/messages?conversationId=${conversationId}`);
 if (res.ok) {
 const data = await res.json();
 setMessages(data);
 }
 } catch (error) {
 console.error('Error fetching messages:', error);
 }
 };

 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
 <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
 <h3 className="text-xl sm:text-2xl font-semibold text-lawlaw-ocean-teal mb-4 flex items-center gap-2">
 <ChatBubbleLeftRightIcon className="w-6 h-6" />
 <span>Messages Oversight</span>
 </h3>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Conversations List */}
 <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
 <h4 className="font-semibold text-gray-700 mb-3">Conversations</h4>
 {conversations.map((conv) => (
 <button
 key={conv.id}
 onClick={() => setSelectedConversation(conv.id)}
 className={`w-full text-left p-3 rounded-lg border transition-colors ${
 selectedConversation === conv.id
 ? 'bg-lawlaw-ocean-teal text-white border-lawlaw-ocean-teal'
 : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className="font-medium text-sm">
 {conv.buyer.name} ↔ {conv.seller.name}
 </span>
 </div>
 {conv.messages[0] && (
 <p className={`text-xs truncate ${
 selectedConversation === conv.id ? 'text-white/80' : 'text-gray-600'
 }`}>
 {conv.messages[0].sender.name}: {conv.messages[0].content}
 </p>
 )}
 </button>
 ))}
 </div>

 {/* Messages Display */}
 <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
 {selectedConversation ? (
 <div className="space-y-3">
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex ${message.sender.role === 'seller' ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-[70%] rounded-lg p-3 ${
 message.sender.role === 'seller'
 ? 'bg-lawlaw-ocean-teal text-white'
 : 'bg-white border border-gray-200'
 }`}>
 <p className="text-xs font-semibold mb-1">
 {message.sender.name} ({message.sender.role})
 </p>
 <p className="text-sm">{message.content}</p>
 <p className={`text-xs mt-1 ${
 message.sender.role === 'seller' ? 'text-white/70' : 'text-gray-500'
 }`}>
 {new Date(message.createdAt).toLocaleString()}
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex items-center justify-center h-full text-gray-500">
 Select a conversation to view messages
 </div>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 );
}
