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

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

interface RecipeFavorite {
  id: string;
  recipeId: string;
  createdAt: string;
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
  };
}

interface SavedRecipe {
  id: string;
  recipeId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'profile' | 'wishlist' | 'favorites' | 'saved'>('overview');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [recipeFavorites, setRecipeFavorites] = useState<RecipeFavorite[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session) {
      fetchProfile();
    }
  }, [session, status, router]);

  useEffect(() => {
    if (profile?.role === 'seller') fetchStats();
  }, [profile]);

  useEffect(() => {
    if (profile && profile.role !== 'seller') {
      fetchUserOrders();
      fetchWishlist();
      fetchRecipeFavorites();
      fetchSavedRecipes();
    }
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Profile fetch error:', errorData);

        if (res.status === 401) {
          toast.error('Please log in to view your profile');
          router.push('/login');
          return;
        }

        throw new Error(errorData.error || 'Failed fetching profile');
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Profile error:', err);
      toast.error('Could not load profile. Please try again.');
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

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      const data = await res.json();
      setWishlistItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecipeFavorites = async () => {
    try {
      const res = await fetch('/api/recipe-favorites', { credentials: 'include' });
      const data = await res.json();
      setRecipeFavorites(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedRecipes = async () => {
    try {
      const res = await fetch('/api/saved-recipes', { credentials: 'include' });
      const data = await res.json();
      setSavedRecipes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      // First, upload the image
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Image upload failed');
      }

      const { imageUrl } = await uploadRes.json();

      // Then create the product with the image URL
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: imageUrl,
          stock: parseInt(newProduct.stock) || 0,
        }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Add failed');

      setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
      setImageFile(null);
      setImagePreview('');
      setShowAddProductForm(false);
      fetchProducts();
      toast.success('Product added successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to add product');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('Deleting product:', productId);
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      console.log('Delete response status:', res.status);
      console.log('Delete response ok:', res.ok);

      if (!res.ok) {
        const text = await res.text();
        console.error('Delete error response text:', text);

        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error' };
        }

        console.error('Delete error response:', errorData);
        throw new Error(errorData.error || `Delete failed with status ${res.status}`);
      }

      fetchProducts();
      toast.success('Product deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Delete product error:', err);
      toast.error(err.message || 'Failed to delete product');
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
      <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Animated background for dark mode */}
        <div className="fixed inset-0 -z-10 hidden dark:block overflow-hidden pointer-events-none">
          <div className="floating-orb absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
          <div className="pulsing-orb absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <Toaster position="top-right" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Skeleton */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="mt-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="mt-2 h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                <div className="w-full mt-6 space-y-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded mb-2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Animated background for dark mode */}
      <div className="fixed inset-0 -z-10 hidden dark:block overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
        <div className="pulsing-orb absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="floating-orb absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '8s' }}></div>
      </div>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

        {/* Sidebar */}
        <aside className="space-y-4 sm:space-y-6 lg:sticky lg:top-28 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20 dark:border-gray-700"
          >
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="profile" className="w-full h-full rounded-full object-cover border-4 border-primary-green/20 shadow-lg" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-green via-leaf-green to-banana-leaf rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {profile.name?.charAt(0).toUpperCase() || (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                  </div>
                )}
              </div>

              <h3 className="mt-3 sm:mt-4 font-bold text-lg sm:text-xl bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent text-center">{profile.name || 'No Name'}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center break-all px-2">{profile.email}</p>
              <span className="mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center gap-1.5">
                {profile.role === 'seller' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Seller
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Buyer
                  </>
                )}
              </span>

              <div className="w-full mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <Link href="/settings" className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white text-sm font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 shadow-lg border border-soft-green/20 dark:border-gray-700 space-y-2 sm:space-y-3"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              {profile.role !== 'seller' && (
                <>
                  <Link href="/orders" className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-center sm:text-left">Orders</span>
                  </Link>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-2 relative"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-center">Wishlist</span>
                    </div>
                    <span className="absolute top-1 right-1 sm:static sm:top-auto sm:right-auto px-1.5 sm:px-2 py-0.5 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-full text-[10px] sm:text-xs font-semibold min-w-[18px] sm:min-w-0 text-center">
                      {wishlistItems.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-rose-50 dark:bg-rose-900 hover:bg-rose-100 dark:hover:bg-rose-800 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-2 relative"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-center hidden sm:inline">Recipe Favorites</span>
                      <span className="text-center sm:hidden">Favorites</span>
                    </div>
                    <span className="absolute top-1 right-1 sm:static sm:top-auto sm:right-auto px-1.5 sm:px-2 py-0.5 bg-rose-200 dark:bg-rose-700 text-rose-800 dark:text-rose-200 rounded-full text-[10px] sm:text-xs font-semibold min-w-[18px] sm:min-w-0 text-center">
                      {recipeFavorites.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-2 relative"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span className="text-center hidden sm:inline">Saved Recipes</span>
                      <span className="text-center sm:hidden">Saved</span>
                    </div>
                    <span className="absolute top-1 right-1 sm:static sm:top-auto sm:right-auto px-1.5 sm:px-2 py-0.5 bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 rounded-full text-[10px] sm:text-xs font-semibold min-w-[18px] sm:min-w-0 text-center">
                      {savedRecipes.length}
                    </span>
                  </button>
                  <Link href="/add-recipe" className="col-span-2 sm:col-span-1 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800 dark:hover:to-orange-700 transition-colors flex flex-row items-center justify-center gap-2 border border-orange-200 dark:border-orange-700">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-semibold">Add Recipe</span>
                  </Link>
                  <Link href="/addresses" className="col-span-2 sm:col-span-1 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex flex-row items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Address Book</span>
                  </Link>
                </>
              )}
              {profile.role === 'seller' && (
                <>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-center">Products</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-center">Orders</span>
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
                  className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors font-medium mt-4 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Apply to Become a Seller
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

          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 shadow-lg border border-soft-green/20 dark:border-gray-700 space-y-2 sm:space-y-3"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account Info
            </p>
            <div className="text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Joined:</span>
                <span className="text-gray-600 dark:text-gray-400">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">Phone:</span>
                  <span className="text-gray-600 dark:text-gray-400">{profile.phone}</span>
                </div>
              )}
            </div>
          </motion.div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-2 space-y-6">

          {/* Order Management for Non-Sellers - Shopee Style */}
          {profile.role !== 'seller' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-soft-green/20 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-2xl bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </h3>
              </div>

              {/* Order Status Tabs - Shopee Style */}
              <div className="border-b border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex overflow-x-auto overflow-y-hidden scrollbar-hide -mb-px" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {[
                    {
                      key: 'all',
                      label: 'All',
                      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
                      count: userOrders.length
                    },
                    {
                      key: 'pending',
                      label: 'To Pay',
                      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
                      count: userOrders.filter(o => o.status === 'pending').length
                    },
                    {
                      key: 'processing',
                      label: 'To Ship',
                      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
                      count: userOrders.filter(o => o.status === 'processing').length
                    },
                    {
                      key: 'shipped',
                      label: 'To Receive',
                      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
                      count: userOrders.filter(o => o.status === 'shipped').length
                    },
                    {
                      key: 'delivered',
                      label: 'Completed',
                      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      count: userOrders.filter(o => o.status === 'delivered').length
                    },
                    {
                      key: 'cancelled',
                      label: 'Cancelled',
                      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      count: userOrders.filter(o => o.status === 'cancelled').length
                    }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderFilter(tab.key)}
                      className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-3 sm:px-4 py-3 sm:py-4 text-center transition-all duration-200 relative ${
                        orderFilter === tab.key
                          ? 'text-primary-green dark:text-green-400 font-semibold'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        {tab.icon}
                        <span className="text-[10px] sm:text-xs leading-tight">{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                            orderFilter === tab.key
                              ? 'bg-primary-green text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </div>
                      {orderFilter === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary-green to-leaf-green"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {userOrders
                  .filter(order => orderFilter === 'all' || order.status === orderFilter)
                  .slice(0, 5)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-green dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                            <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">#{order.id.slice(0, 8)}<span className="hidden sm:inline">{order.id.slice(8, 12)}</span></p>
                          </div>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex gap-2 sm:gap-4">
                            <img
                              src={item.product.image || '/placeholder.png'}
                              alt={item.product.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.product.id}`}
                                className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white hover:text-primary-green dark:hover:text-green-400 line-clamp-2 block"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">x{item.quantity}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-xs sm:text-sm text-primary-green">${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-200 dark:border-gray-700 gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className="hidden sm:inline">Order Date: </span>
                          <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Order Total</p>
                            <p className="text-base sm:text-lg font-bold text-primary-green">${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <Link
                            href={`/orders/${order.id}`}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-primary-green to-leaf-green text-white text-xs sm:text-sm font-medium hover:from-leaf-green hover:to-soft-green transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                          >
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Empty State */}
                {userOrders.filter(order => orderFilter === 'all' || order.status === orderFilter).length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders found</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {orderFilter === 'all' ? "You haven't placed any orders yet" : `You have no ${orderFilter} orders`}
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:from-leaf-green hover:to-soft-green transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Start Shopping
                    </Link>
                  </div>
                )}

                {/* View All Orders Button */}
                {userOrders.filter(order => orderFilter === 'all' || order.status === orderFilter).length > 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/orders"
                      className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green dark:text-green-400 dark:hover:text-green-300 font-medium"
                    >
                      View All Orders
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Wishlist, Favorites & Saved Recipes for Non-Sellers */}
          {profile.role !== 'seller' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-soft-green/20 dark:border-gray-700"
            >
              <h3 className="font-bold text-2xl bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                My Collections
              </h3>

              {/* Tabs for Wishlist, Favorites, and Saved Recipes */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                  { key: 'wishlist', label: 'Wishlist', count: wishlistItems.length },
                  { key: 'favorites', label: 'Recipe Favorites', count: recipeFavorites.length },
                  { key: 'saved', label: 'Saved Recipes', count: savedRecipes.length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-primary-green to-banana-leaf text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Wishlist Content */}
              {activeTab === 'wishlist' && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">My Wishlist</h4>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p>Your wishlist is empty</p>
                      <Link href="/products" className="text-primary-green hover:underline mt-2 inline-block">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex gap-4">
                          <img
                            src={item.product.image || '/placeholder.png'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <Link href={`/products/${item.product.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-green">
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.product.description}</p>
                            <p className="font-semibold text-primary-green mt-1">${item.product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recipe Favorites Content */}
              {activeTab === 'favorites' && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Favorite Recipes</h4>
                  {recipeFavorites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p>You haven't favorited any recipes yet</p>
                      <Link href="/recipes" className="text-primary-green hover:underline mt-2 inline-block">
                        Explore Recipes
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recipeFavorites.map((fav) => (
                        <div key={fav.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex gap-4">
                          <img
                            src={fav.recipe.image || '/placeholder.png'}
                            alt={fav.recipe.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <Link href={`/recipes/${fav.recipe.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-green">
                              {fav.recipe.title}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{fav.recipe.description}</p>
                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>⏱️ {fav.recipe.prepTime + fav.recipe.cookTime} min</span>
                              <span>🍽️ {fav.recipe.servings} servings</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Saved Recipes Content */}
              {activeTab === 'saved' && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Saved Recipes</h4>
                  {savedRecipes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <p>You haven't saved any recipes yet</p>
                      <Link href="/recipes" className="text-primary-green hover:underline mt-2 inline-block">
                        Explore Recipes
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedRecipes.map((saved) => (
                        <div key={saved.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex gap-4">
                          <img
                            src={saved.recipe.image || '/placeholder.png'}
                            alt={saved.recipe.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <Link href={`/recipes/${saved.recipe.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-green">
                              {saved.recipe.title}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{saved.recipe.description}</p>
                            {saved.notes && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                Note: {saved.notes}
                              </p>
                            )}
                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>⏱️ {saved.recipe.prepTime + saved.recipe.cookTime} min</span>
                              <span>🍽️ {saved.recipe.servings} servings</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Seller Dashboard */}
          {profile.role === 'seller' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-soft-green/20 dark:border-gray-700 p-6"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-2">
                  <svg className="w-8 h-8 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Seller Dashboard
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your business operations</p>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  {
                    key: 'overview',
                    label: 'Overview',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  },
                  {
                    key: 'products',
                    label: 'Products',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  },
                  {
                    key: 'orders',
                    label: 'Orders',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  },
                  {
                    key: 'analytics',
                    label: 'Analytics',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                  },
                  {
                    key: 'profile',
                    label: 'Business',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-primary-green to-banana-leaf text-white shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md'
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
                      <StatCard label="Total Products" value={stats.totalProducts} color="green" icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      } />
                      <StatCard label="Total Orders" value={stats.totalOrders} color="blue" icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      } />
                      <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="yellow" icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      } />
                      <StatCard label="Pending" value={stats.pendingProducts} color="red" icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      } />
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
                        onClick={() => {
                          setShowAddProductForm(!showAddProductForm);
                          if (showAddProductForm) {
                            // Reset form when canceling
                            setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
                            setImageFile(null);
                            setImagePreview('');
                          }
                        }}
                        className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors flex items-center gap-2"
                      >
                        {showAddProductForm ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                          </>
                        )}
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
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="fresh">Fresh</option>
                          <option value="dried">Dried</option>
                          <option value="processed">Processed</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Stock Quantity"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Product Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary-green file:text-white
                              hover:file:bg-leaf-green
                              file:cursor-pointer cursor-pointer"
                            required
                          />
                          {imagePreview && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                              />
                            </div>
                          )}
                        </div>
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
                          className="bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-leaf-green transition-colors col-span-full font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Add Product
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
                                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(p.id)}
                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
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
                  <div className="text-gray-500 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Analytics coming soon...
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
const StatCard = ({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) => {
  const bgMap: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200',
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    yellow: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    red: 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200',
  };
  return (
    <div className={`p-4 rounded-lg shadow text-center ${bgMap[color] || 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
};
