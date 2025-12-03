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

 // Tutorial/Onboarding states
 const [showTutorial, setShowTutorial] = useState(false);
 const [tutorialStep, setTutorialStep] = useState(0);
 const [showTooltips, setShowTooltips] = useState(false);

 // Check if first time visit
 useEffect(() => {
 const hasSeenTutorial = localStorage.getItem('profileTutorialCompleted');
 if (!hasSeenTutorial && profile) {
 setShowTutorial(true);
 }
 }, [profile]);

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

 if (!res.ok) {
 const errorData = await res.json();
 throw new Error(errorData.error || 'Failed to add product');
 }

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
 <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-12 px-4 sm:px-6 lg:px-8 relative">
 {/* Animated background for dark mode */}
 <div className="fixed inset-0 -z-10 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
 <div className="pulsing-orb absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
 </div>
 <Toaster position="top-right" />

 <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Sidebar Skeleton */}
 <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
 <div className="bg-white rounded-2xl p-6 shadow animate-pulse">
 <div className="flex flex-col items-center">
 <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
 <div className="mt-4 h-6 bg-gray-200 rounded w-32"></div>
 <div className="mt-2 h-4 bg-gray-200 rounded w-48"></div>
 <div className="mt-2 h-6 bg-gray-200 rounded-full w-24"></div>
 <div className="w-full mt-6 space-y-2">
 <div className="h-10 bg-gray-200 rounded-lg"></div>
 <div className="h-10 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-2xl p-4 shadow space-y-3 animate-pulse">
 <div className="h-4 bg-gray-200 rounded w-24"></div>
 <div className="space-y-2">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
 ))}
 </div>
 </div>

 <div className="bg-white rounded-2xl p-4 shadow space-y-2 animate-pulse">
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 <div className="h-4 bg-gray-200 rounded w-40"></div>
 <div className="h-4 bg-gray-200 rounded w-36"></div>
 </div>
 </aside>

 {/* Main Content Skeleton */}
 <main className="lg:col-span-2 space-y-6">
 <div className="bg-white rounded-2xl p-6 shadow animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="bg-gray-100 p-4 rounded-lg">
 <div className="h-8 w-8 bg-gray-200 rounded mb-2 mx-auto"></div>
 <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
 <div className="h-8 bg-gray-200 rounded w-12 mx-auto"></div>
 </div>
 ))}
 </div>

 <div className="space-y-2">
 <div className="h-10 bg-gray-200 rounded-lg"></div>
 <div className="h-10 bg-gray-200 rounded-lg"></div>
 </div>

 <div className="mt-6 space-y-3">
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-gray-50 p-4 rounded-lg">
 <div className="flex justify-between items-center">
 <div className="space-y-2 flex-1">
 <div className="h-5 bg-gray-200 rounded w-32"></div>
 <div className="h-4 bg-gray-200 rounded w-24"></div>
 </div>
 <div className="space-y-2">
 <div className="h-5 bg-gray-200 rounded w-16"></div>
 <div className="h-4 bg-gray-200 rounded w-20"></div>
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

 // Tutorial steps configuration
 const tutorialSteps = profile?.role === 'seller' ? [
 { target: 'profile-completion', title: 'Complete Your Profile', content: 'Fill in your profile information to unlock all features and build trust with customers.' },
 { target: 'quick-actions', title: 'Quick Actions', content: 'Access your seller dashboard, manage products, view orders, and check analytics from here.' },
 { target: 'performance-overview', title: 'Performance Overview', content: 'Track your sales, revenue, and business metrics at a glance.' },
 ] : [
 { target: 'profile-completion', title: 'Complete Your Profile', content: 'Add your details to personalize your shopping experience.' },
 { target: 'achievement-badges', title: 'Earn Badges', content: 'Complete activities to earn achievement badges and unlock rewards!' },
 { target: 'quick-actions', title: 'Quick Actions', content: 'Access your orders, wishlist, favorite recipes, and more from this menu.' },
 { target: 'shopping-insights', title: 'Shopping Insights', content: 'View your order history, spending, and saved items.' },
 ];

 const completeTutorial = () => {
 localStorage.setItem('profileTutorialCompleted', 'true');
 setShowTutorial(false);
 setTutorialStep(0);
 toast.success('Tutorial completed! You can always access help from settings.');
 };

 const nextTutorialStep = () => {
 if (tutorialStep < tutorialSteps.length - 1) {
 setTutorialStep(tutorialStep + 1);
 } else {
 completeTutorial();
 }
 };

 const skipTutorial = () => {
 completeTutorial();
 };

 if (!profile) return null;

 return (
 <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative">
 {/* Animated background for dark mode */}
 <div className="fixed inset-0 -z-10 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
 <div className="pulsing-orb absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
 <div className="floating-orb absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '8s' }}></div>
 </div>
 <Toaster position="top-right" />

 {/* Tutorial Overlay */}
 {showTutorial && (
 <>
 {/* Dark overlay */}
 <div className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm" onClick={skipTutorial}></div>

 {/* Tutorial Card */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] bg-white rounded-2xl shadow-2xl p-6 max-w-md w-[90%] sm:w-full border-2 border-primary-green"
 >
 {/* Progress Indicator */}
 <div className="flex gap-2 mb-4">
 {tutorialSteps.map((_, index) => (
 <div
 key={index}
 className={`flex-1 h-1.5 rounded-full transition-all ${
 index <= tutorialStep ? 'bg-primary-green' : 'bg-gray-200'
 }`}
 />
 ))}
 </div>

 {/* Tutorial Content */}
 <div className="mb-6">
 <div className="flex items-start gap-3 mb-3">
 <div className="bg-primary-green/10 p-2 rounded-lg">
 <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-1">
 {tutorialSteps[tutorialStep].title}
 </h3>
 <p className="text-sm text-gray-600">
 Step {tutorialStep + 1} of {tutorialSteps.length}
 </p>
 </div>
 </div>
 <p className="text-gray-700 leading-relaxed">
 {tutorialSteps[tutorialStep].content}
 </p>
 </div>

 {/* Tutorial Actions */}
 <div className="flex gap-3">
 <button
 onClick={skipTutorial}
 className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
 >
 Skip Tutorial
 </button>
 <button
 onClick={nextTutorialStep}
 className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-green to-leaf-green text-white font-medium hover:shadow-lg transition-all"
 >
 {tutorialStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started'}
 </button>
 </div>
 </motion.div>
 </>
 )}

 {/* Help Button - Floating */}
 <motion.button
 initial={{ opacity: 0, scale: 0 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 1 }}
 onClick={() => setShowTooltips(!showTooltips)}
 className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-[100] bg-gradient-to-r from-primary-green to-leaf-green text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all group"
 title="Toggle Help Tooltips"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 {showTooltips && (
 <span className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
 Tooltips Active
 </span>
 )}
 </motion.button>

 <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

 {/* Sidebar */}
 <aside className="space-y-4 sm:space-y-6 lg:sticky lg:top-28 lg:self-start">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-soft-green/20"
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
 <p className="text-xs sm:text-sm text-gray-600 text-center break-all px-2">{profile.email}</p>
 <span className="mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1.5">
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

 {/* Profile Completion Progress */}
 <div id="profile-completion" className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 relative">
 {showTooltips && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="absolute -top-2 -right-2 z-10"
 >
 <div className="bg-primary-green text-white text-xs px-2 py-1 rounded-full animate-bounce flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Complete profile!
 </div>
 </motion.div>
 )}
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-semibold text-gray-700">Profile Completion</span>
 <span className="text-xs font-bold text-primary-green">
 {(() => {
 let completionScore = 40; // Base score for having an account
 if (profile.name) completionScore += 20;
 if (profile.phone) completionScore += 20;
 if (profile.profilePicture) completionScore += 20;
 return completionScore;
 })()}%
 </span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
 <motion.div
 initial={{ width: 0 }}
 animate={{
 width: `${(() => {
 let completionScore = 40;
 if (profile.name) completionScore += 20;
 if (profile.phone) completionScore += 20;
 if (profile.profilePicture) completionScore += 20;
 return completionScore;
 })()}%`
 }}
 transition={{ duration: 1, ease: "easeOut" }}
 className="bg-gradient-to-r from-primary-green to-leaf-green h-2.5 rounded-full"
 ></motion.div>
 </div>
 <div className="space-y-1">
 {!profile.name && (
 <p className="text-[10px] text-gray-600 flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 Add your name
 </p>
 )}
 {!profile.phone && (
 <p className="text-[10px] text-gray-600 flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 Add phone number
 </p>
 )}
 {!profile.profilePicture && (
 <p className="text-[10px] text-gray-600 flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 Upload profile picture
 </p>
 )}
 {profile.name && profile.phone && profile.profilePicture && (
 <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 Profile Complete!
 </p>
 )}
 </div>
 </div>

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

 {/* Achievement Badges */}
 <motion.div
 id="achievement-badges"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 className="bg-white rounded-2xl p-4 shadow-lg border border-soft-green/20 relative"
 >
 {showTooltips && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="absolute -top-3 -right-3 z-10"
 >
 <div className="bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
 <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
 </svg>
 Earn badges!
 </div>
 </motion.div>
 )}
 <p className="text-xs text-gray-600 font-bold uppercase tracking-wide flex items-center gap-2 mb-3">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
 </svg>
 Achievements
 </p>
 <div className="grid grid-cols-3 gap-2">
 {/* First Purchase Badge */}
 {userOrders.length > 0 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl border-2 border-green-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-[8px] font-bold text-green-700 mt-1 text-center">First Order</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 Completed your first purchase!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {/* Active Shopper Badge */}
 {userOrders.length >= 5 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl border-2 border-blue-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
 </svg>
 <p className="text-[8px] font-bold text-blue-700 mt-1 text-center">Active Shopper</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 Placed 5+ orders!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {/* Loyal Customer Badge */}
 {userOrders.length >= 10 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl border-2 border-yellow-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
 </svg>
 <p className="text-[8px] font-bold text-yellow-700 mt-1 text-center">Loyal Customer</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 10+ orders completed!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {/* Recipe Contributor Badge */}
 {savedRecipes.length >= 3 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl border-2 border-purple-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
 </svg>
 <p className="text-[8px] font-bold text-purple-700 mt-1 text-center">Recipe Lover</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 Saved 3+ recipes!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {/* Wishlist Curator Badge */}
 {wishlistItems.length >= 5 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-3 rounded-xl border-2 border-pink-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 <p className="text-[8px] font-bold text-pink-700 mt-1 text-center">Wishlist Curator</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 5+ items in wishlist!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {/* Profile Complete Badge */}
 {profile.name && profile.phone && profile.profilePicture && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 rounded-xl border-2 border-indigo-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 <p className="text-[8px] font-bold text-indigo-700 mt-1 text-center">All Set</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 Profile completed!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {/* Seller Badges */}
 {profile.role === 'seller' && stats && (
 <>
 {stats.totalProducts >= 5 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl border-2 border-orange-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 <p className="text-[8px] font-bold text-orange-700 mt-1 text-center">Top Seller</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 5+ products listed!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}

 {stats.totalOrders >= 10 && (
 <div className="relative group">
 <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-xl border-2 border-red-300 flex flex-col items-center justify-center aspect-square">
 <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
 <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
 </svg>
 <p className="text-[8px] font-bold text-red-700 mt-1 text-center">Super Seller</p>
 </div>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
 <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
 10+ orders fulfilled!
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 </div>
 </div>
 )}
 </>
 )}
 </div>

 {/* Badge Progress Message */}
 {userOrders.length === 0 && savedRecipes.length === 0 && wishlistItems.length === 0 && (
 <p className="text-xs text-gray-500 text-center mt-3">
 Complete activities to earn badges!
 </p>
 )}
 </motion.div>

 <motion.div
 id="quick-actions"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-soft-green/20 relative overflow-hidden"
 >
 {/* Background decoration */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-green/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

 {showTooltips && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
 >
 <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-4 py-2 rounded-full shadow-lg whitespace-nowrap flex items-center gap-2">
 <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 Quick access menu
 </div>
 </motion.div>
 )}

 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
 <div className="p-1.5 bg-gradient-to-br from-primary-green to-leaf-green rounded-lg">
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 </div>
 Quick Actions
 </h3>
 </div>

 {profile.role !== 'seller' ? (
 /* User Quick Actions - Modern Grid Layout */
 <div className="space-y-3">
 {/* Main Action Buttons - 2x2 Grid on Mobile */}
 <div className="grid grid-cols-2 gap-2 sm:gap-3">
 <Link
 href="/orders"
 className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 border border-emerald-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <div className="flex flex-col items-center gap-2">
 <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 </div>
 <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">My Orders</span>
 </div>
 </Link>

 <Link
 href="/addresses"
 className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <div className="flex flex-col items-center gap-2">
 <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 </div>
 <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">Addresses</span>
 </div>
 </Link>
 </div>

 {/* Collections Card - Full Width with Badges */}
 <Link
 href="/collections"
 className="group block p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 border border-purple-200/50 transition-all duration-300 hover:shadow-md"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </div>
 <div>
 <span className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors">My Collections</span>
 <p className="text-[10px] sm:text-xs text-gray-500">Wishlist, Favorites & Saved</p>
 </div>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="px-2 py-1 bg-yellow-400/20 text-yellow-700 rounded-full text-[10px] sm:text-xs font-bold border border-yellow-300/50">
 {wishlistItems.length}
 </span>
 <span className="px-2 py-1 bg-rose-400/20 text-rose-700 rounded-full text-[10px] sm:text-xs font-bold border border-rose-300/50">
 {recipeFavorites.length}
 </span>
 <span className="px-2 py-1 bg-purple-400/20 text-purple-700 rounded-full text-[10px] sm:text-xs font-bold border border-purple-300/50">
 {savedRecipes.length}
 </span>
 <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </Link>

 {/* Add Recipe Button - Full Width */}
 <Link
 href="/add-recipe"
 className="group flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border border-orange-200/50 transition-all duration-300 hover:shadow-md"
 >
 <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 </div>
 <span className="text-sm sm:text-base font-bold text-orange-700">Share Your Recipe</span>
 </Link>
 </div>
 ) : (
 /* Seller Quick Actions - Modern Grid Layout */
 <div className="space-y-3">
 {/* Main Action Buttons - 2x2 Grid */}
 <div className="grid grid-cols-2 gap-2 sm:gap-3">
 <Link
 href="/seller-dashboard"
 className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50 hover:from-green-100 hover:to-emerald-200/50 border border-green-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <div className="flex flex-col items-center gap-2">
 <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 </div>
 <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">Dashboard</span>
 </div>
 </Link>

 <Link
 href="/seller-products"
 className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 border border-purple-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <div className="flex flex-col items-center gap-2">
 <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 </div>
 <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">Products</span>
 </div>
 </Link>

 <Link
 href="/seller-orders"
 className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 border border-orange-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <div className="flex flex-col items-center gap-2">
 <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
 </svg>
 </div>
 <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-orange-700 transition-colors">Orders</span>
 </div>
 </Link>

 <Link
 href="/seller-analytics"
 className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
 >
 <div className="flex flex-col items-center gap-2">
 <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
 </svg>
 </div>
 <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">Analytics</span>
 </div>
 </Link>
 </div>

 {/* Collections Card - Full Width with Badges */}
 <Link
 href="/collections"
 className="group block p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 border border-purple-200/50 transition-all duration-300 hover:shadow-md"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </div>
 <div>
 <span className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors">My Collections</span>
 <p className="text-[10px] sm:text-xs text-gray-500">Wishlist, Favorites & Saved</p>
 </div>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="px-2 py-1 bg-yellow-400/20 text-yellow-700 rounded-full text-[10px] sm:text-xs font-bold border border-yellow-300/50">
 {wishlistItems.length}
 </span>
 <span className="px-2 py-1 bg-rose-400/20 text-rose-700 rounded-full text-[10px] sm:text-xs font-bold border border-rose-300/50">
 {recipeFavorites.length}
 </span>
 <span className="px-2 py-1 bg-purple-400/20 text-purple-700 rounded-full text-[10px] sm:text-xs font-bold border border-purple-300/50">
 {savedRecipes.length}
 </span>
 <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </Link>

 {/* Add Recipe Button - Full Width */}
 <Link
 href="/seller-shop?action=add"
 className="group flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 border border-emerald-300/50 transition-all duration-300 hover:shadow-md"
 >
 <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
 <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 </div>
 <span className="text-sm sm:text-base font-bold text-emerald-700">Add New Recipe</span>
 </Link>
 </div>
 )}
 </motion.div>

 {/* Become a Seller Section */}
 {profile.role !== 'seller' && !profile.sellerApplication && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-4 sm:p-5 shadow-lg border border-soft-green/20 relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-green/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
 <div className="flex items-start gap-3 sm:gap-4">
 <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary-green to-leaf-green rounded-xl shadow-sm flex-shrink-0">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">Become a Seller</h3>
 <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
 Start selling your products and grow your business today!
 </p>
 <button
 onClick={() => router.push('/seller-application')}
 className="w-full sm:w-auto bg-gradient-to-r from-primary-green to-leaf-green text-white px-4 py-2.5 rounded-xl hover:shadow-md transition-all duration-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 Apply Now
 </button>
 </div>
 </div>
 </motion.div>
 )}

 {/* Seller Application Status */}
 {profile.sellerApplication && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 className="bg-gradient-to-br from-yellow-50 to-amber-50/50 rounded-2xl p-4 sm:p-5 shadow-lg border border-yellow-200/50"
 >
 <div className="flex items-start gap-3 sm:gap-4">
 <div className="p-2.5 sm:p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-sm flex-shrink-0">
 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-sm sm:text-base font-bold text-yellow-800 mb-1">Application Status</h3>
 <p className="text-xs sm:text-sm text-gray-700">
 Your seller application is <span className="font-bold text-yellow-700 capitalize">{profile.sellerApplication.status}</span>
 </p>
 <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
 Submitted: {new Date(profile.sellerApplication.submittedAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </motion.div>
 )}

 {/* Account Info */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-soft-green/20 space-y-2 sm:space-y-3"
 >
 <p className="text-xs text-gray-600 font-bold uppercase tracking-wide flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Account Info
 </p>
 <div className="text-xs sm:text-sm space-y-2">
 <div className="flex items-center gap-2 text-gray-700">
 <svg className="w-4 h-4 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 <span className="font-medium">Joined:</span>
 <span className="text-gray-600">{new Date(profile.createdAt).toLocaleDateString()}</span>
 </div>
 {profile.phone && (
 <div className="flex items-center gap-2 text-gray-700">
 <svg className="w-4 h-4 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
 </svg>
 <span className="font-medium">Phone:</span>
 <span className="text-gray-600">{profile.phone}</span>
 </div>
 )}
 </div>
 </motion.div>
 </aside>

 {/* Main Content */}
 <main className="lg:col-span-2 space-y-6">

 {/* Activity Timeline */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-6"
 >
 <h3 className="font-bold text-2xl bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-2 mb-6">
 <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Recent Activity
 </h3>
 <div className="space-y-4">
 {/* Activity Item */}
 {userOrders.length > 0 && (
 <div className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
 <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
 </svg>
 </div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-gray-900">Order Placed</p>
 <p className="text-xs text-gray-600 mt-1">
 You placed an order worth ${userOrders[0]?.totalAmount.toFixed(2)}
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {new Date(userOrders[0]?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </p>
 </div>
 </div>
 )}

 {savedRecipes.length > 0 && (
 <div className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
 <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
 </svg>
 </div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-gray-900">Recipe Saved</p>
 <p className="text-xs text-gray-600 mt-1">
 You saved "{savedRecipes[0]?.recipe.title}"
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {new Date(savedRecipes[0]?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </p>
 </div>
 </div>
 )}

 {wishlistItems.length > 0 && (
 <div className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
 <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
 <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-gray-900">Added to Wishlist</p>
 <p className="text-xs text-gray-600 mt-1">
 You added "{wishlistItems[0]?.product.name}" to your wishlist
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {new Date(wishlistItems[0]?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </p>
 </div>
 </div>
 )}

 <div className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
 <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 </div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-gray-900">Account Created</p>
 <p className="text-xs text-gray-600 mt-1">
 Welcome to Lawlaw Delights!
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </p>
 </div>
 </div>

 {(userOrders.length === 0 && savedRecipes.length === 0 && wishlistItems.length === 0) && (
 <div className="text-center py-8 text-gray-500">
 <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p>No recent activity</p>
 <p className="text-sm">Start shopping or saving recipes!</p>
 </div>
 )}
 </div>
 </motion.div>

 {/* Shopping Insights for Buyers */}
 {profile.role !== 'seller' && userOrders.length > 0 && (
 <motion.div
 id="shopping-insights"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-6 relative"
 >
 {showTooltips && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="absolute top-2 right-2 z-10"
 >
 <div className="bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 Your stats
 </div>
 </motion.div>
 )}
 <h3 className="font-bold text-2xl bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-2 mb-6">
 <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 Shopping Insights
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
 </svg>
 <span className="text-xs font-medium text-green-700">Total Orders</span>
 </div>
 <p className="text-2xl font-bold text-green-900">{userOrders.length}</p>
 </div>

 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="text-xs font-medium text-blue-700">Total Spent</span>
 </div>
 <p className="text-2xl font-bold text-blue-900">
 ${userOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
 </p>
 </div>

 <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 <span className="text-xs font-medium text-yellow-700">Wishlist</span>
 </div>
 <p className="text-2xl font-bold text-yellow-900">{wishlistItems.length}</p>
 </div>

 <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
 </svg>
 <span className="text-xs font-medium text-purple-700">Saved Recipes</span>
 </div>
 <p className="text-2xl font-bold text-purple-900">{savedRecipes.length}</p>
 </div>
 </div>
 </motion.div>
 )}

 {/* Performance Widget for Sellers */}
 {profile.role === 'seller' && stats && (
 <motion.div
 id="performance-overview"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-6 relative"
 >
 {showTooltips && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="absolute top-2 right-2 z-10"
 >
 <div className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 Business metrics
 </div>
 </motion.div>
 )}
 <div className="flex items-center justify-between mb-6">
 <h3 className="font-bold text-2xl bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-2">
 <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 Performance Overview
 </h3>
 <Link href="/seller-dashboard" className="text-sm text-primary-green hover:text-leaf-green font-medium flex items-center gap-1">
 View Full Dashboard
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </Link>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 <span className="text-xs font-semibold text-green-700">Products</span>
 </div>
 <p className="text-3xl font-bold text-green-900">{stats.totalProducts}</p>
 <p className="text-xs text-green-600 mt-1">{stats.pendingProducts} pending</p>
 </div>

 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <span className="text-xs font-semibold text-blue-700">Orders</span>
 </div>
 <p className="text-3xl font-bold text-blue-900">{stats.totalOrders}</p>
 <p className="text-xs text-blue-600 mt-1">All time</p>
 </div>

 <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="text-xs font-semibold text-yellow-700">Revenue</span>
 </div>
 <p className="text-3xl font-bold text-yellow-900">${stats.totalRevenue.toFixed(0)}</p>
 <p className="text-xs text-yellow-600 mt-1">Total earned</p>
 </div>

 <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
 <div className="flex items-center gap-2 mb-2">
 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 <span className="text-xs font-semibold text-purple-700">Avg Order</span>
 </div>
 <p className="text-3xl font-bold text-purple-900">
 ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : '0'}
 </p>
 <p className="text-xs text-purple-600 mt-1">Per order</p>
 </div>
 </div>

 {/* Recent Orders Mini List */}
 {stats.recentOrders.length > 0 && (
 <div>
 <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Recent Orders
 </h4>
 <div className="space-y-2">
 {stats.recentOrders.slice(0, 3).map((order) => (
 <div key={order.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
 <div className="flex-1">
 <p className="font-medium text-sm text-gray-900">{order.user.name}</p>
 <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
 </div>
 <div className="text-right">
 <p className="font-semibold text-primary-green">${order.totalAmount.toFixed(2)}</p>
 <span className={`text-xs px-2 py-0.5 rounded-full ${
 order.status === 'delivered' ? 'bg-green-100 text-green-700' :
 order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
 order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
 'bg-orange-100 text-orange-700'
 }`}>
 {order.status}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
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
 green: 'bg-green-50 text-green-800',
 blue: 'bg-blue-50 text-blue-800',
 yellow: 'bg-yellow-50 text-yellow-800',
 red: 'bg-red-50 text-red-800',
 };
 return (
 <div className={`p-4 rounded-lg shadow text-center ${bgMap[color] || 'bg-gray-50 text-gray-700'}`}>
 <div className="flex justify-center mb-2">{icon}</div>
 <p className="text-sm font-medium">{label}</p>
 <p className="mt-1 text-2xl font-semibold">{value}</p>
 </div>
 );
};
