'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  role: string;
  profilePicture: string | null;
  createdAt: string;
  lastLogin?: string;
  sellerApplication?: {
    id: string;
    businessName: string;
    businessType: string;
    status: string;
    submittedAt: string;
  };
}

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    orderItems: Array<{ product: { name: string } }>;
  }>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  status: string;
}

interface SellerOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  orderItems: Array<{ product: { name: string }; quantity: number }>;
}

interface SellerProfile {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  address?: string;
  phone?: string;
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'profile'>('overview');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else fetchProfile();
  }, [session, status, router]);

  useEffect(() => {
    if (profile?.role === 'seller') fetchStats();
  }, [profile]);

  useEffect(() => {
    if (profile && profile.role !== 'seller') fetchUserOrders();
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'seller') {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'profile') fetchSellerProfile();
    }
  }, [activeTab, profile]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed fetching profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seller/stats', { credentials: 'include' });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products', { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        if (data.error) {
          toast.error(`Error loading products: ${data.error}`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch products');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const res = await fetch('/api/seller/profile', { credentials: 'include' });
      const data = await res.json();
      setSellerProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      const data = await res.json();
      setUserOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: newProduct.image,
          stock: parseInt(newProduct.stock) || 0,
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Add failed');
      setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
      setShowAddProductForm(false);
      fetchProducts();
      toast.success('Product added successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchProducts();
      toast.success('Product deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
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

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully!');
      router.push('/login');
    } catch (err) {
      console.error(err);
      toast.error('Failed to logout');
    }
  };
    const fetchSellerApplication = async () => {
      try {
        const res = await fetch('/api/seller-application', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch application');
        const data = await res.json();
        setProfile(prev => prev ? { ...prev, sellerApplication: data.application } : prev);
      } catch (err) {
        console.error(err);
      }
    };



  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-green"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="profile" className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl text-white font-bold">
                    {profile.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                )}
              </div>

              <h3 className="mt-4 font-semibold text-lg text-primary-green dark:text-green-300">{profile.name || 'No Name'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">{profile.email}</p>
              <span className="mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {profile.role === 'seller' ? '🏪 Seller' : '🛍️ Buyer'}
              </span>

              <div className="w-full mt-6 space-y-2">
                <Link href="/settings" className="block px-4 py-2 rounded-lg bg-primary-green text-white text-sm text-center hover:bg-leaf-green transition-colors">
                  ⚙️ Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-300 font-semibold uppercase tracking-wide">Quick Actions</p>
            <div className="grid grid-cols-1 gap-2">
              {profile.role !== 'seller' && (
                <>
                  <Link href="/orders" className="text-sm p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors flex items-center gap-2">
                    📦 View Orders
                  </Link>
                  <Link href="/wishlist" className="text-sm p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors flex items-center gap-2">
                    ❤️ Wishlist
                  </Link>
                  <Link href="/addresses" className="text-sm p-3 rounded-lg bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center gap-2">
                    📍 Address Book
                  </Link>
                </>
              )}
              {profile.role === 'seller' && (
                <>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-sm p-3 rounded-lg bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors flex items-center gap-2"
                  >
                    📦 Manage Products
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm p-3 rounded-lg bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex items-center gap-2"
                  >
                    📋 View Orders
                  </button>
                </>
              )}
            </div>
            {profile.role !== 'seller' && !profile.sellerApplication && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mt-6"
            >
              <h3 className="text-lg font-semibold text-primary-green dark:text-green-300 mb-3">Become a Seller</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Start selling your products and grow your business. Apply to become a seller today!
              </p>
              {profile.role !== 'seller' && !profile.sellerApplication && (
                <button
                  onClick={() => router.push('/seller-application')}
                  className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors font-medium mt-4"
                >
                  🏪 Apply to Become a Seller
                </button>
              )}
            </motion.div>
          )}

          {profile.sellerApplication && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 dark:bg-yellow-900 rounded-2xl p-6 shadow mt-6"
            >
              <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-200 mb-3">Seller Application Status</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your application for becoming a seller is currently <span className="font-semibold">{profile.sellerApplication.status}</span>.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Submitted on: {new Date(profile.sellerApplication.submittedAt).toLocaleDateString()}
              </p>
            </motion.div>
          )}

          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-300 font-semibold uppercase tracking-wide">Account Info</p>
            <div className="text-sm space-y-1">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Joined:</span> {new Date(profile.createdAt).toLocaleDateString()}
              </p>
              {profile.phone && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Phone:</span> {profile.phone}
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-2 space-y-6">

          {/* Order Management for Non-Sellers */}
          {profile.role !== 'seller' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow"
            >
              <h3 className="font-semibold text-xl text-primary-green dark:text-green-300 mb-4">Order Management</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">💳</div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">To Pay</p>
                  <p className="text-2xl font-bold text-primary-green">{userOrders.filter(o => o.status === 'pending').length}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">🛒</div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Processing</p>
                  <p className="text-2xl font-bold text-primary-green">{userOrders.filter(o => o.status === 'processing').length}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">To Receive</p>
                  <p className="text-2xl font-bold text-primary-green">{userOrders.filter(o => o.status === 'shipped').length}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Delivered</p>
                  <p className="text-2xl font-bold text-primary-green">{userOrders.filter(o => o.status === 'delivered').length}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/orders"
                  className="flex-1 bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-leaf-green transition-colors text-center font-medium"
                >
                  View All Orders
                </Link>
                <Link
                  href={`/chat?orderId=${userOrders[0]?.id || ''}`}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-center font-medium"
                >
                  💬 Contact Seller
                </Link>
              </div>

              {/* Recent Orders */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Recent Orders</h4>
                <div className="space-y-3">
                  {userOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-green">${order.totalAmount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Seller Dashboard */}
          {profile.role === 'seller' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary-green dark:text-green-300">Seller Dashboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">Manage your business operations</p>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'overview', label: 'Overview', icon: '📊' },
                  { key: 'products', label: 'Products', icon: '📦' },
                  { key: 'orders', label: 'Orders', icon: '📋' },
                  { key: 'analytics', label: 'Analytics', icon: '📈' },
                  { key: 'profile', label: 'Business', icon: '🏪' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-primary-green text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="space-y-4">
                {activeTab === 'overview' && stats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Total Products" value={stats.totalProducts} color="green" icon="📦" />
                      <StatCard label="Total Orders" value={stats.totalOrders} color="blue" icon="📋" />
                      <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="yellow" icon="💰" />
                      <StatCard label="Pending" value={stats.pendingProducts} color="red" icon="⏳" />
                    </div>

                    {/* Recent Orders Preview */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Recent Orders</h4>
                      <div className="space-y-2">
                        {stats.recentOrders.slice(0, 5).map((order) => (
                          <div key={order.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{order.user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary-green">${order.totalAmount}</p>
                              <span className="text-xs">{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Product Inventory</h3>
                      <button
                        onClick={() => setShowAddProductForm(!showAddProductForm)}
                        className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors flex items-center gap-2"
                      >
                        {showAddProductForm ? '❌ Cancel' : '➕ Add Product'}
                      </button>
                    </div>

                    {showAddProductForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        onSubmit={handleAddProduct}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg"
                      >
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price ($)"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Stock Quantity"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 md:col-span-2"
                        />
                        <textarea
                          placeholder="Product Description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 md:col-span-2"
                          rows={3}
                          required
                        />
                        <button
                          type="submit"
                          className="bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-leaf-green transition-colors col-span-full font-medium"
                        >
                          ✅ Add Product
                        </button>
                      </motion.form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(products) && products.map((p) => (
                        <motion.div 
                          key={p.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={p.image || '/placeholder.png'}
                            alt={p.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-lg text-primary-green dark:text-green-300">{p.name}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{p.description}</p>
                            <div className="mt-3 flex justify-between items-center">
                              <div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">${p.price}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {p.stock}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                p.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                p.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                                            <button
                                onClick={() => setEditingProduct(p.id)}
                                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(p.id)}
                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>

                            {/* Delete confirmation */}
                            {showDeleteConfirm === p.id && (
                              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900 rounded-lg text-sm text-red-800 dark:text-red-200 flex justify-between items-center">
                                <span>Are you sure?</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Orders</h3>
                    <div className="mb-4 flex gap-2 flex-wrap">
                      {['all', 'pending', 'processing', 'shipped', 'delivered'].map(status => (
                        <button
                          key={status}
                          onClick={() => setOrderFilter(status)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            orderFilter === status
                              ? 'bg-primary-green text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Customer: {order.user.name} ({order.user.email})</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-semibold text-primary-green">${order.totalAmount}</p>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="p-1 text-sm rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                            >
                              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                      {filteredOrders.length === 0 && <p className="text-gray-500 dark:text-gray-400">No orders found.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && sellerProfile && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Business Profile</h3>
                    <p><span className="font-medium">Name:</span> {sellerProfile.businessName}</p>
                    <p><span className="font-medium">Type:</span> {sellerProfile.businessType}</p>
                    {sellerProfile.description && <p><span className="font-medium">Description:</span> {sellerProfile.description}</p>}
                    {sellerProfile.address && <p><span className="font-medium">Address:</span> {sellerProfile.address}</p>}
                    {sellerProfile.phone && <p><span className="font-medium">Phone:</span> {sellerProfile.phone}</p>}
                  </div>
                )}

                {/* Analytics Tab Placeholder */}
                {activeTab === 'analytics' && (
                  <div className="text-gray-500 dark:text-gray-300">
                    📈 Analytics coming soon...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

// StatCard Component
const StatCard = ({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) => {
  const bgMap: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200',
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    yellow: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    red: 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200',
  };
  return (
    <div className={`p-4 rounded-lg shadow text-center ${bgMap[color] || 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
};
