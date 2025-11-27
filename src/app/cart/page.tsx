'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartItem {
 id: string;
 productId: string;
 quantity: number;
 product: {
 id: string;
 name: string;
 price: number;
 image: string;
 };
}

export default function CartPage() {
 const [cartItems, setCartItems] = useState<CartItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [updating, setUpdating] = useState<string | null>(null);
 const router = useRouter();

 useEffect(() => {
 fetchCartItems();
 }, []);

 const fetchCartItems = async () => {
 try {
 const response = await fetch('/api/cart');
 if (response.ok) {
 const items = await response.json();
 setCartItems(items);
 } else if (response.status === 401) {
 // User not authenticated, redirect to login
 router.push('/login');
 }
 } catch (error) {
 console.error('Error fetching cart:', error);
 } finally {
 setLoading(false);
 }
 };

 const updateQuantity = async (cartItemId: string, newQuantity: number) => {
 if (newQuantity <= 0) {
 await removeItem(cartItemId);
 return;
 }

 setUpdating(cartItemId);
 try {
 const response = await fetch(`/api/cart/${cartItemId}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ quantity: newQuantity }),
 });

 if (response.ok) {
 setCartItems(cartItems.map(item =>
 item.id === cartItemId ? { ...item, quantity: newQuantity } : item
 ));
 }
 } catch (error) {
 console.error('Error updating quantity:', error);
 } finally {
 setUpdating(null);
 }
 };

 const removeItem = async (cartItemId: string) => {
 setUpdating(cartItemId);
 try {
 const response = await fetch(`/api/cart/${cartItemId}`, {
 method: 'DELETE',
 });

 if (response.ok) {
 setCartItems(cartItems.filter(item => item.id !== cartItemId));
 }
 } catch (error) {
 console.error('Error removing item:', error);
 } finally {
 setUpdating(null);
 }
 };

 const clearCart = async () => {
 try {
 const response = await fetch('/api/cart', {
 method: 'DELETE',
 });

 if (response.ok) {
 setCartItems([]);
 }
 } catch (error) {
 console.error('Error clearing cart:', error);
 }
 };

 const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 relative">
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
 <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
 </div>
 <div className="container mx-auto px-4 relative z-10">
 <div className="max-w-6xl mx-auto">
 {/* Header Skeleton */}
 <div className="mb-8 animate-pulse">
 <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
 <div className="h-6 bg-gray-200 rounded w-64"></div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Cart Items Skeleton */}
 <div className="lg:col-span-2 space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
 <div className="flex gap-6">
 <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0"></div>
 <div className="flex-1 space-y-3">
 <div className="h-6 bg-gray-200 rounded w-3/4"></div>
 <div className="h-5 bg-gray-200 rounded w-24"></div>
 <div className="flex items-center gap-4 mt-4">
 <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
 <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Summary Skeleton */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24 animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
 <div className="space-y-4 mb-6">
 <div className="flex justify-between">
 <div className="h-5 bg-gray-200 rounded w-20"></div>
 <div className="h-5 bg-gray-200 rounded w-24"></div>
 </div>
 <div className="flex justify-between">
 <div className="h-5 bg-gray-200 rounded w-24"></div>
 <div className="h-5 bg-gray-200 rounded w-20"></div>
 </div>
 </div>
 <div className="border-t pt-4 mb-6">
 <div className="flex justify-between">
 <div className="h-6 bg-gray-200 rounded w-16"></div>
 <div className="h-8 bg-gray-200 rounded w-28"></div>
 </div>
 </div>
 <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (cartItems.length === 0) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 relative">
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
 <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
 </div>
 <div className="container mx-auto px-4 relative z-10">
 <div className="text-center py-16">
 <div className="text-6xl mb-6">🛒</div>
 <h1 className="text-4xl font-bold text-primary-green mb-4">Your Cart is Empty</h1>
 <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
 Looks like you haven't added any Lawlaw delicacies yet. Let's fill that cart with some delicious treats!
 </p>
 <Link
 href="/products"
 className="btn-hover inline-block bg-primary-green text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-leaf-green transition-colors duration-300"
 >
 Start Shopping
 </Link>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 relative">
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
 <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '4s' }}></div>
 <div className="floating-orb absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '7s' }}></div>
 </div>
 <div className="container mx-auto px-4 relative z-10">
 <div className="mb-8 fade-in-up">
 <h1 className="text-4xl font-bold text-primary-green mb-2">Your Cart</h1>
 <p className="text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Cart Items */}
 <div className="lg:col-span-2 space-y-4">
 {cartItems.map((item) => (
 <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 fade-in-up">
 <div className="flex items-center space-x-4">
 <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
 <Image
 src={item.product.image || "/api/placeholder/80/80"}
 alt={item.product.name}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-semibold text-primary-green mb-1">{item.product.name}</h3>
 <p className="text-gray-600">₱{item.product.price}</p>
 </div>
 <div className="flex items-center space-x-4">
 <div className="flex items-center space-x-2">
 <button
 onClick={() => updateQuantity(item.id, item.quantity - 1)}
 disabled={updating === item.id}
 className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 text-gray-900"
 >
 -
 </button>
 <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
 <button
 onClick={() => updateQuantity(item.id, item.quantity + 1)}
 disabled={updating === item.id}
 className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 text-gray-900"
 >
 +
 </button>
 </div>
 <div className="text-right">
 <p className="text-xl font-bold text-primary-green">₱{item.product.price * item.quantity}</p>
 <button
 onClick={() => removeItem(item.id)}
 disabled={updating === item.id}
 className="text-red-500 hover:text-red-700 text-sm mt-1 disabled:opacity-50"
 >
 Remove
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Order Summary */}
 <div className="bg-white rounded-2xl shadow-lg p-6 h-fit border border-gray-100 fade-in-up">
 <h2 className="text-2xl font-bold text-primary-green mb-6">Order Summary</h2>

 <div className="space-y-4 mb-6">
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
 <span className="font-semibold text-gray-900">₱{total}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Shipping</span>
 <span className="font-semibold text-gray-900">{total > 500 ? 'Free' : '₱50'}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Tax</span>
 <span className="font-semibold text-gray-900">₱{Math.round(total * 0.12)}</span>
 </div>
 <div className="border-t pt-4">
 <div className="flex justify-between items-center text-xl font-bold text-primary-green">
 <span>Total</span>
 <span>₱{total + (total > 500 ? 0 : 50) + Math.round(total * 0.12)}</span>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <Link
 href="/checkout"
 className="btn-hover w-full bg-primary-green text-white px-6 py-4 rounded-xl font-semibold text-center hover:bg-leaf-green transition-colors duration-300 block"
 >
 Proceed to Checkout
 </Link>

 <button
 onClick={clearCart}
 className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-300"
 >
 Clear Cart
 </button>

 <Link
 href="/products"
 className="w-full bg-transparent text-primary-green px-6 py-3 rounded-xl font-medium border border-primary-green hover:bg-primary-green hover:text-white transition-colors duration-300 block text-center"
 >
 Continue Shopping
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
