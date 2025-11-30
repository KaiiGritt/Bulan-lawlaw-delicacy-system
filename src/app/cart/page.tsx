'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package } from 'lucide-react';

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
  const shipping = total > 500 ? 0 : 50;
  const tax = Math.round(total * 0.12);
  const grandTotal = total + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-6 sm:py-12 relative">
        <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
          <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-6 sm:mb-8 animate-pulse">
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-40 sm:w-48 mb-3 sm:mb-4"></div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 sm:w-64"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* Cart Items Skeleton */}
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 animate-pulse">
                    <div className="flex gap-3 sm:gap-6">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-200 rounded-lg sm:rounded-xl flex-shrink-0"></div>
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24"></div>
                        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <div className="h-9 sm:h-10 w-28 sm:w-32 bg-gray-200 rounded-lg"></div>
                          <div className="h-9 sm:h-10 w-16 sm:w-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Skeleton */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 sticky top-20 sm:top-24 animate-pulse">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-28 sm:w-32 mb-4 sm:mb-6"></div>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-16 sm:w-20"></div>
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24"></div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 sm:pt-4 mb-4 sm:mb-6">
                    <div className="flex justify-between">
                      <div className="h-6 sm:h-7 bg-gray-200 rounded w-14 sm:w-16"></div>
                      <div className="h-7 sm:h-8 bg-gray-200 rounded w-24 sm:w-28"></div>
                    </div>
                  </div>
                  <div className="h-11 sm:h-12 bg-gray-200 rounded-xl w-full"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 sm:py-16 relative">
        <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
          <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-primary-green/10 rounded-full mb-6 sm:mb-8">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-primary-green" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
              Looks like you haven't added any Lawlaw delicacies yet. Let's fill that cart with some delicious treats!
            </p>
            <Link
              href="/products"
              className="btn-hover inline-flex items-center gap-2 bg-primary-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-leaf-green transition-colors duration-300"
            >
              <Package className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-6 sm:py-12 relative">
      <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '4s' }}></div>
        <div className="floating-orb absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '7s' }}></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 fade-in-up">
            <Link href="/products" className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green transition-colors duration-300 mb-4 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Continue Shopping</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green mb-1 sm:mb-2">Shopping Cart</h1>
                <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
                </p>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="hidden sm:flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 border border-gray-100 transition-all duration-300 fade-in-up hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-3 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group">
                      <Image
                        src={item.product.image || "/api/placeholder/128/128"}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="block"
                        >
                          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary-green mb-1 sm:mb-2 hover:text-leaf-green transition-colors duration-300 line-clamp-2">{item.product.name}</h3>
                        </Link>
                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">₱{item.product.price.toFixed(2)} each</p>
                      </div>

                      {/* Mobile layout: Quantity and Remove stacked */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-primary-green hover:text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 font-bold text-xl shadow-sm hover:shadow-md active:scale-95"
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <span className="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg text-gray-900 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-primary-green hover:text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 font-bold text-xl shadow-sm hover:shadow-md active:scale-95"
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                          <div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{item.quantity} × ₱{item.product.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="flex items-center gap-1 sm:gap-2 text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors duration-300 px-3 py-1.5 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Clear Cart Button */}
              <button
                onClick={clearCart}
                className="sm:hidden w-full flex items-center justify-center gap-2 text-red-500 hover:text-white bg-white hover:bg-red-500 transition-colors duration-300 px-4 py-3 rounded-xl font-medium border-2 border-red-200"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Items
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 border-2 border-primary-green/20 lg:sticky lg:top-24 fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-6 h-6 text-primary-green" />
                  <h2 className="text-xl sm:text-2xl font-bold text-primary-green">Order Summary</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-base sm:text-lg text-gray-900">₱{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                    <span className="font-semibold text-base sm:text-lg text-gray-900">{shipping === 0 ? <span className="text-green-600">Free</span> : `₱${shipping}`}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs sm:text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      You've qualified for free shipping!
                    </p>
                  )}
                  {total > 0 && total <= 500 && (
                    <p className="text-xs sm:text-sm text-warm-orange bg-orange-50 px-3 py-2 rounded-lg">
                      Add ₱{(500 - total).toFixed(2)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Tax (12%)</span>
                    <span className="font-semibold text-base sm:text-lg text-gray-900">₱{tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t-2 border-dashed pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">Total</span>
                      <span className="text-2xl sm:text-3xl font-bold text-primary-green">₱{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="btn-hover w-full bg-gradient-to-r from-primary-green to-leaf-green text-white px-6 py-4 rounded-xl font-bold text-center hover:shadow-xl transition-all duration-300 block"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/products"
                    className="w-full bg-transparent text-primary-green px-6 py-3 rounded-xl font-semibold border-2 border-primary-green hover:bg-primary-green hover:text-white transition-all duration-300 block text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Fast</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Quality</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
