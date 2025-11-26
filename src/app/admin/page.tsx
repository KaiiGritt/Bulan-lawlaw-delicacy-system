

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UsersTab from "./UsersTab";
import toast, { Toaster } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'overview' | 'users' | 'products' | 'orders' | 'analytics' | 'sellerApplications';


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

function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-green/10 flex items-center justify-center text-2xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-primary-green">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // small loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-green"></div>
      </div>
    );
  }

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 text-gray-900">
      <Toaster position="top-right" />
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-white/30"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-6 w-6 text-primary-green" />
            </button>

            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center overflow-hidden">
                {/* local logo path; if using next/image choose static import to avoid runtime warnings */}
                <Image src="/logo.png" alt="Logo" width={40} height={40} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-green">Admin Dashboard</h1>
                <p className="text-xs text-gray-600">Manage users, products and orders</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-primary-green hover:underline flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" /> Back to site
            </Link>
            <div className="rounded-full bg-white p-2 shadow text-lg">👤</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className={`col-span-3 lg:col-span-3 transition-all ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/30">
              <nav className="space-y-1">
                {([
                  { id: 'overview', label: 'Overview' },
                  { id: 'users', label: 'Users' },
                  { id: 'products', label: 'Products' },
                  { id: 'orders', label: 'Orders' },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'sellerApplications', label: 'Seller Applications' },
                ] as { id: TabId; label: string }[]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                      activeTab === t.id ? 'bg-primary-green text-white' : 'text-gray-700 hover:bg-white/60'
                    }`}
                  >
                    <span className="font-medium">{t.label}</span>
                    <span className="text-xs text-gray-500">{activeTab === t.id ? '●' : ''}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Quick: Manage Orders
                </button>
                <Link href="/admin/settings" className="block text-center text-sm text-gray-600 hover:underline py-1">
                  Admin Settings
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="col-span-9 lg:col-span-9">
            {/* OVERVIEW */}
            {activeTab === 'overview' && stats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
                  <StatCard label="Total Products" value={stats.totalProducts} icon="📦" />
                  <StatCard label="Total Orders" value={stats.totalOrders} icon="📋" />
                  <StatCard label="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} icon="💰" />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                  <h3 className="text-lg font-semibold text-primary-green mb-3">Recent Seller Applications</h3>
                  {stats.pendingSellerApplications.length ? (
                    <div className="space-y-3">
                      {stats.pendingSellerApplications.map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{app.businessName}</p>
                            <p className="text-sm text-gray-600">{app.businessType} • {app.user.name || app.user.email}</p>
                            <p className="text-xs text-gray-500">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApplication(app.id, 'approved')} className="px-3 py-1 rounded-lg bg-primary-green text-white">Approve</button>
                            <button onClick={() => handleApplication(app.id, 'rejected')} className="px-3 py-1 rounded-lg bg-red-500 text-white">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No pending applications</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-primary-green">Order Management</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => fetchOrders()} className="px-3 py-2 rounded-lg bg-white border hover:shadow">Refresh</button>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders found</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-primary-green">Order #{order.id.slice(-8)}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">By {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {order.adminApprovalRequired ? (
                                <>
                                  <button onClick={() => handleApproveCancellation(order.id, true)} className="px-3 py-1 rounded-lg bg-green-500 text-white">Approve Cancel</button>
                                  <button onClick={() => handleApproveCancellation(order.id, false)} className="px-3 py-1 rounded-lg bg-red-500 text-white">Reject Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => openCancelModal(order)} className="px-3 py-1 rounded-lg bg-red-500 text-white">Cancel Order</button>
                                  <button onClick={() => openConfirmModal(order)} className="px-3 py-1 rounded-lg bg-white border">Mark as Processed</button>
                                </>
                              )}

                              <button
                                onClick={() => toggleExpand(order.id)}
                                className="p-2 rounded-md bg-white border hover:shadow"
                                aria-expanded={!!expandedOrders[order.id]}
                                title="Expand"
                              >
                                {expandedOrders[order.id] ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedOrders[order.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 overflow-hidden"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-lg border">
                                      <p className="text-sm text-gray-600"><strong>Shipping:</strong> {order.shippingAddress}</p>
                                      <p className="text-sm text-gray-600"><strong>Billing:</strong> {order.billingAddress}</p>
                                      <p className="text-sm text-gray-600"><strong>Payment:</strong> {order.paymentMethod}</p>
                                      <p className="text-sm text-gray-600"><strong>Total:</strong> ₱{order.totalAmount.toFixed(2)}</p>
                                      {order.cancellationReason && (
                                        <p className="text-sm text-red-700 mt-2"><strong>Cancellation Reason:</strong> {order.cancellationReason}</p>
                                      )}
                                      {order.cancelledAt && (
                                        <p className="text-sm text-red-600"><strong>Cancelled At:</strong> {new Date(order.cancelledAt).toLocaleString()}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="grid grid-cols-1 gap-3">
                                      {order.orderItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                          <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                            {item.product.image ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="text-sm text-gray-500">{item.product.name.slice(0,1)}</div>
                                            )}
                                          </div>

                                          <div className="flex-1">
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-600">{item.quantity} × ₱{item.price.toFixed(2)}</p>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                  <h3 className="text-xl font-semibold text-primary-green mb-4">Seller Applications</h3>
                  {stats.pendingSellerApplications.length === 0 ? (
                    <p className="text-gray-500">No pending applications</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.pendingSellerApplications.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{app.businessName}</p>
                            <p className="text-sm text-gray-600">{app.businessType} • {app.user.name || app.user.email}</p>
                            <p className="text-xs text-gray-500">Submitted {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => handleApplication(app.id, 'approved')} className="px-3 py-1 rounded-lg bg-primary-green text-white">
                              <CheckCircleIcon className="h-4 w-4 inline-block mr-1" /> Approve
                            </button>
                            <button onClick={() => handleApplication(app.id, 'rejected')} className="px-3 py-1 rounded-lg bg-red-600 text-white">
                              <XCircleIcon className="h-4 w-4 inline-block mr-1" /> Reject
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
              <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                <h3 className="text-xl font-semibold text-primary-green mb-3">Analytics</h3>
                <p className="text-sm text-gray-600">Analytics placeholder — add Recharts / Chart.js components here.</p>
              </div>
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
                  className="px-4 py-2 rounded-lg bg-primary-green text-white"
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
  const [refreshKey, setRefreshKey] = useState(0); // to refetch after actions

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

  async function updateProductStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/${status}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update product status');
      toast.success(`Product ${status}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product status');
    }
  }

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
    <div>
      <h3 className="text-xl font-semibold text-primary-green mb-3">Products</h3>
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Stock</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Featured</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-100">
                  <td className="p-2 border-b">
                    {prod.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.image} alt={prod.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-300 flex items-center justify-center rounded text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-2 border-b">{prod.name}</td>
                  <td className="p-2 border-b">
                    {editingCategoryId === prod.id ? (
                      <>
                        <input
                          type="text"
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          className="border rounded px-1 py-0.5 w-24"
                        />
                        <button
                          onClick={() => updateCategory(prod.id, categoryInput)}
                          className="ml-2 bg-primary-green text-white rounded px-2 py-1 text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="ml-1 bg-gray-300 rounded px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingCategoryId(prod.id);
                          setCategoryInput(prod.category || '');
                        }}
                        className="cursor-pointer hover:underline"
                        title="Click to edit category"
                      >
                        {prod.category || 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="p-2 border-b">₱{prod.price.toFixed(2)}</td>
                  <td className="p-2 border-b">{prod.stock}</td>
                  <td className="p-2 border-b">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${
                      prod.status === 'approved' ? 'bg-green-100 text-green-800' :
                      prod.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      prod.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={prod.featured || false}
                      onChange={() => toggleFeatured(prod.id)}
                    />
                  </td>
                  <td className="p-2 border-b space-x-2">
                    {prod.status !== 'approved' && (
                      <>
                        <button
                          onClick={() => updateProductStatus(prod.id, 'approve')}
                          className="bg-primary-green text-white px-2 py-1 rounded text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateProductStatus(prod.id, 'reject')}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeProduct(prod.id)}
                      className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
