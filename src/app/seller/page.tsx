'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Type Definitions
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
  user: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    product: {
      name: string;
    };
  }>;
}

interface SellerProfile {
  id: string;
  businessName: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
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

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'profile') fetchProfile();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch seller statistics');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: newProduct.image,
          stock: parseInt(newProduct.stock) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to add product');

      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
      });
      setShowAddProductForm(false);
      fetchProducts(); // Refresh products list
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-xl mb-4">⚠️ {error}</p>
        <button
          onClick={fetchStats}
          className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50">
      {/* Header */}
      <header className="glassmorphism sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
            <Image src="/logo.png" alt="Lawlaw Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold text-primary-green hover:text-leaf-green transition-colors duration-300">
              Seller Dashboard
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">Welcome, Seller</span>
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hover:text-primary-green transition text-xl"
              >👤</button>
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Seller</p>
                      <p className="text-xs text-gray-500">Seller Account</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-green transition">My Account</Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-green transition"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/" className="btn-hover text-primary-green hover:text-leaf-green text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/60">
              ← Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'products', label: 'My Products', icon: '📦' },
              { id: 'orders', label: 'Orders', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'profile', label: 'Profile', icon: '👤' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary-green text-white shadow-md'
                    : 'text-gray-700 hover:bg-white/60 hover:text-primary-green'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon="📦" label="Total Products" value={stats.totalProducts} />
              <StatCard icon="📋" label="Total Orders" value={stats.totalOrders} />
              <StatCard icon="💰" label="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} />
              <StatCard icon="⏳" label="Pending Products" value={stats.pendingProducts} />
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-primary-green mb-4">Recent Orders</h3>
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">Customer: {order.user.name || order.user.email}</p>
                      <p className="text-xs text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-green">₱{order.totalAmount.toLocaleString()}</p>
                      <p className={`text-sm ${order.status === 'delivered' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary-green">My Products</h3>
              <button
                onClick={() => setShowAddProductForm(!showAddProductForm)}
                className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green transition-colors duration-200"
              >
                + Add Product
              </button>
            </div>

            {showAddProductForm && (
              <form onSubmit={handleAddProduct} className="mb-8 p-6 bg-gray-50 rounded-xl">
                <h4 className="text-lg font-semibold mb-4">Add New Product</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="fresh">Fresh</option>
                    <option value="dried">Dried</option>
                    <option value="processed">Processed</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg"
                    min="0"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg md:col-span-2"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg md:col-span-2"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    type="submit"
                    className="bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-leaf-green transition-colors"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductForm(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-xl p-4">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    <h4 className="font-semibold text-lg">{product.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <p className="text-primary-green font-bold">₱{product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    <p className={`text-sm ${product.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>
                      Status: {product.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No products yet. Add your first product!</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Order Management</h3>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">Customer: {order.user.name || order.user.email}</p>
                        <p className="text-xs text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-green text-lg">₱{order.totalAmount.toLocaleString()}</p>
                        <p className={`text-sm ${order.status === 'delivered' ? 'text-green-600' : 'text-orange-600'}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No orders yet</p>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Analytics</h3>
            <p className="text-gray-600 mb-6">View detailed analytics and insights. Feature coming soon.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-primary-green mb-4">Seller Profile</h3>
            {profile ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="text-lg font-semibold">{profile.businessName}</p>
                </div>
                {profile.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-lg">{profile.description}</p>
                  </div>
                )}
                {profile.contactEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="text-lg">{profile.contactEmail}</p>
                  </div>
                )}
                {profile.contactPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="text-lg">{profile.contactPhone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Loading profile...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper component ---
function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="card-hover bg-white p-6 rounded-2xl shadow-lg border border-gray-100 fade-in-up">
      <div className="flex items-center">
        <div className="p-3 bg-primary-green/10 rounded-xl text-3xl">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-primary-green">{value}</p>
        </div>
      </div>
    </div>
  );
}