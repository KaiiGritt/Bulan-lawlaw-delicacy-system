'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
  orderItems: Array<{ product: { name: string } }>;
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
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem('prefers-dark');
    return val ? val === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'profile'>('overview');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
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
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else fetchProfile();
  }, [session, status]);

  useEffect(() => {
    if (profile?.role === 'seller') fetchStats();
  }, [profile]);

  useEffect(() => {
    if (profile && profile.role !== 'seller') {
      fetchUserOrders();
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'seller') {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'profile') fetchSellerProfile();
    }
  }, [activeTab, profile]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('prefers-dark', dark ? 'true' : 'false');
  }, [dark]);

  // ----------- Fetch Functions ----------
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProfile(data);
      setEditProfile({ name: data.name || '', email: data.email, phone: data.phone || '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seller/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const res = await fetch('/api/seller/profile');
      const data = await res.json();
      setSellerProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setUserOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ----------- Avatar Upload ----------
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/user/avatar', { method: 'POST', body: formData });
      if (res.ok) {
        const updated = await res.json();
        setProfile(prev => prev ? { ...prev, profilePicture: updated.profilePicture } : prev);
        toast.success('Avatar updated!');
      } else toast.error('Failed to upload avatar');
    } catch (err) {
      console.error(err);
      toast.error('Upload error');
    }
  };

  // ----------- Edit Personal Info ----------
  const handleProfileUpdate = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditMode(false);
        toast.success('Profile updated!');
      } else toast.error('Failed to update profile');
    } catch (err) {
      console.error(err);
      toast.error('Update error');
    }
  };

  // ----------- Change Password ----------
  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      if (res.ok) {
        setPasswords({ current: '', newPassword: '', confirm: '' });
        toast.success('Password changed!');
      } else toast.error('Failed to change password');
    } catch (err) {
      console.error(err);
      toast.error('Error changing password');
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
      });
      if (res.ok) {
        setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
        setShowAddProductForm(false);
        fetchProducts();
      } else toast.error('Failed to add product');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-green"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-28">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center relative">
            <div className="relative w-32 h-32">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">👤</span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-primary-green p-2 rounded-full cursor-pointer hover:bg-leaf-green transition-colors">
                <input type="file" className="hidden" onChange={handleAvatarUpload} />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                  <path d="M4 7h12M4 10h12M4 13h12" />
                </svg>
              </label>
            </div>
            <h3 className="mt-4 font-semibold text-lg text-primary-green dark:text-green-300">{profile.name || 'No Name'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">{profile.email}</p>
            <button onClick={() => setDark(!dark)} className="w-full mt-4 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium">
              Toggle {dark ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
            <h1 className="text-3xl font-bold text-primary-green dark:text-green-300">My Profile</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">Manage your account information and security.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={editProfile.name}
                    onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    placeholder="Full Name"
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                    placeholder="Email"
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                  <input
                    type="text"
                    value={editProfile.phone || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                    placeholder="Phone"
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                  <button
                    onClick={handleProfileUpdate}
                    className="bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-leaf-green transition-colors col-span-full"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">Full Name</p>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.name || 'Not provided'}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">Email</p>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.email}</p>
                  </div>
                  {profile.phone && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">Phone</p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.phone}</p>
                    </div>
                  )}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">Member Since</p>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">User ID</p>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.id}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">User Type</p>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-leaf-green transition-colors col-span-full"
                  >
                    Edit Info
                  </button>
                </>
              )}
            </div>

            {/* Apply to Become Seller */}
            {profile.role !== 'seller' && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">Become a Seller</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">Join our community of local Lawlaw product sellers and start selling your products.</p>
                <Link
                  href="/seller-application"
                  className="mt-3 inline-block bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-leaf-green transition-colors"
                >
                  Apply to Become a Seller
                </Link>
              </div>
            )}

            {/* Change Password */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
              <h3 className="font-semibold text-lg">Change Password</h3>
              <input
                type="password"
                placeholder="Current Password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-800"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-800"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-800"
              />
              <button
                onClick={handlePasswordChange}
                className="bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-leaf-green transition-colors"
              >
                Update Password
              </button>
            </div>

            {/* Order Management for Non-Sellers */}
            {profile.role !== 'seller' && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-xl">
                <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">Order Management</h3>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">Track and manage your orders.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Link href="/orders" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🛒</div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">To Order</p>
                      <p className="text-lg font-semibold text-primary-green">{userOrders.filter(o => o.status === 'processing').length}</p>
                    </div>
                  </Link>
                  <Link href="/orders" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-2xl mb-2">💳</div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">To Pay</p>
                      <p className="text-lg font-semibold text-primary-green">{userOrders.filter(o => o.status === 'pending').length}</p>
                    </div>
                  </Link>
                  <Link href="/orders" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📦</div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">To Receive</p>
                      <p className="text-lg font-semibold text-primary-green">{userOrders.filter(o => o.status === 'shipped').length}</p>
                    </div>
                  </Link>
                  <Link href="/orders" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⭐</div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">To Rate</p>
                      <p className="text-lg font-semibold text-primary-green">{userOrders.filter(o => o.status === 'delivered').length}</p>
                    </div>
                  </Link>
                </div>
                <div className="mt-4 flex justify-center">
                  <Link
                    href={`/chat?orderId=${userOrders[0]?.id || ''}`}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Contact Sellers for Order Issues
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ------------------ Seller Dashboard ------------------ */}
          {profile.role === 'seller' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-primary-green dark:text-green-300">Seller Dashboard</h2>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {[{ key: 'overview', label: 'Overview' }, { key: 'products', label: 'Products' }, { key: 'orders', label: 'Orders' }, { key: 'analytics', label: 'Analytics' }, { key: 'profile', label: 'Business Profile' }].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${activeTab === tab.key ? 'bg-white dark:bg-gray-600 text-primary-green dark:text-green-300 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'overview' && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard label="Total Products" value={stats.totalProducts} color="green" />
                    <StatCard label="Total Orders" value={stats.totalOrders} color="blue" />
                    <StatCard label="Total Revenue" value={`$${stats.totalRevenue}`} color="yellow" />
                    <StatCard label="Pending Products" value={stats.pendingProducts} color="red" />
                  </div>
                )}

                {activeTab === 'products' && (
                  <div>
                    <button onClick={() => setShowAddProductForm(!showAddProductForm)} className="mb-4 bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors">
                      {showAddProductForm ? 'Cancel' : 'Add New Product'}
                    </button>
                    {showAddProductForm && (
                      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <input type="text" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800" required />
                        <input type="text" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800" required />
                        <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800" required />
                        <input type="text" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800" required />
                        <input type="text" placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800" />
                        <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800" />
                        <button type="submit" className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors col-span-full">Add Product</button>
                      </form>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                          <img src={p.image} className="w-full h-40 object-cover rounded-lg mb-2" />
                          <h4 className="font-semibold text-primary-green dark:text-green-300">{p.name}</h4>
                          <p className="text-gray-600 dark:text-gray-300">${p.price}</p>
                          <p className="text-sm text-gray-400 dark:text-gray-200">{p.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-2">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Total:</strong> ${order.totalAmount}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>User:</strong> {order.user.name} ({order.user.email})</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'analytics' && <p>Analytics content goes here</p>}

                {activeTab === 'profile' && sellerProfile && (
                  <div className="space-y-2">
                    <p><strong>Business Name:</strong> {sellerProfile.businessName}</p>
                    <p><strong>Type:</strong> {sellerProfile.businessType}</p>
                    <p><strong>Phone:</strong> {sellerProfile.phone}</p>
                    <p><strong>Description:</strong> {sellerProfile.description}</p>
                    <p><strong>Address:</strong> {sellerProfile.address}</p>
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

// ---------- Helper Components ----------
const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <div className={`p-4 rounded-lg shadow text-center bg-${color}-50 dark:bg-${color}-900`}>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);
