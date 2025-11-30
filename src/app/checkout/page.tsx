'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Package, ShoppingBag, ArrowLeft, CheckCircle, Lock, Truck, Plus, Minus } from 'lucide-react';
import { Address } from '../components/AddressCard';
import ChangeAddressDialog from '../components/ChangeAddressDialog';
import AddressForm, { AddressFormData } from '../components/AddressForm';

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

interface PaymentInfo {
  method: 'cod' | 'gcash' | 'card';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ method: 'cod' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');
  const [isChangeAddressOpen, setIsChangeAddressOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
    fetchDefaultAddress();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
      } else if (response.status === 401) {
        router.push('/login');
        return;
      } else {
        setError('Failed to load cart items');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const addresses: Address[] = await response.json();
        const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error fetching default address:', error);
    }
  };

  const handleAddAddress = async (addressData: AddressFormData) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const newAddress = await response.json();
        setSelectedAddress(newAddress);
        setIsAddAddressOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address');
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + shipping + tax;

  const handlePaymentChange = (method: 'cod' | 'gcash' | 'card') => {
    setPaymentInfo({ method });
  };

  const handlePlaceOrder = async () => {
    setError('');

    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const shippingAddress = `${selectedAddress.fullName}, ${selectedAddress.phoneNumber}, ${selectedAddress.streetAddress}, ${selectedAddress.barangay}, ${selectedAddress.city}, ${selectedAddress.province}, ${selectedAddress.region} ${selectedAddress.postalCode}`;
      const billingAddress = shippingAddress;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          billingAddress,
          paymentMethod: paymentInfo.method,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderPlaced(true);
        setTimeout(() => {
          router.push('/products');
        }, 3000);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('An error occurred while placing your order');
    } finally {
      setIsProcessing(false);
    }
  };

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
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-32 sm:w-40 mb-3 sm:mb-4"></div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 sm:w-64"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* Checkout Form Skeleton */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-40 sm:w-48 mb-4 sm:mb-6"></div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                      <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Skeleton */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 sticky top-20 sm:top-24 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 sm:w-36 mb-4 sm:mb-6"></div>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
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
              You need items in your cart to proceed to checkout.
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

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 sm:py-16 relative">
        <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
          <div className="pulsing-orb absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="floating-orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 px-4">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-green-100 rounded-full mb-6 sm:mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green mb-3 sm:mb-4">Order Placed Successfully!</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-green-200">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-green mb-4 sm:mb-6 flex items-center justify-center gap-2">
                <Package className="w-6 h-6" />
                Order Summary
              </h2>
              <div className="text-left space-y-3 text-gray-900">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm sm:text-base text-gray-600">Order ID:</span>
                  <span className="font-semibold">#LD-{Date.now()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm sm:text-base text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg sm:text-xl text-primary-green">₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm sm:text-base text-gray-600">Estimated Delivery:</span>
                  <span className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    3-5 business days
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/products"
              className="btn-hover inline-flex items-center gap-2 bg-primary-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-leaf-green transition-colors duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-6 sm:py-12 relative">
      <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="pulsing-orb absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '5s' }}></div>
        <div className="floating-orb absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '8s' }}></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 fade-in-up">
            <Link href="/cart" className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green transition-colors duration-300 mb-4 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Cart</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green mb-1 sm:mb-2">Checkout</h1>
                <p className="text-sm sm:text-base text-gray-600">Complete your order for Lawlaw delicacies</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              {/* Delivery Address Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 border-2 border-gray-100 fade-in-up hover:shadow-2xl transition-shadow duration-300">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary-green flex items-center gap-2">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-warm-orange" />
                    Delivery Address
                  </h2>
                  {selectedAddress && (
                    <button
                      onClick={() => setIsChangeAddressOpen(true)}
                      className="text-sm sm:text-base text-warm-orange hover:text-earth-brown font-semibold transition-colors duration-300 px-3 py-1.5 rounded-lg hover:bg-orange-50"
                    >
                      Change
                    </button>
                  )}
                </div>

                {selectedAddress ? (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900">{selectedAddress.fullName}</h3>
                        <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedAddress.phoneNumber}
                        </p>
                      </div>
                      {selectedAddress.isDefault && (
                        <span className="px-2.5 py-1 bg-warm-orange text-white text-xs font-bold rounded-full">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {selectedAddress.streetAddress}, {selectedAddress.barangay}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.region} {selectedAddress.postalCode}
                    </p>
                    {selectedAddress.landmark && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Landmark: {selectedAddress.landmark}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">No delivery address selected</p>
                    <button
                      onClick={() => setIsAddAddressOpen(true)}
                      className="btn-hover inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-warm-orange text-white rounded-xl font-semibold hover:bg-earth-brown transition-all duration-300 text-sm sm:text-base"
                    >
                      <MapPin className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 border-2 border-gray-100 fade-in-up hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-green mb-4 sm:mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-warm-orange" />
                  Payment Method
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                    { id: 'gcash', label: 'GCash', icon: '📱', desc: 'Digital payment' },
                    { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Secure online payment' }
                  ].map((payment) => (
                    <label
                      key={payment.id}
                      className={`flex items-center p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                        paymentInfo.method === payment.id
                          ? 'border-primary-green bg-green-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-green/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={payment.id}
                        checked={paymentInfo.method === payment.id}
                        onChange={() => handlePaymentChange(payment.id as 'cod' | 'gcash' | 'card')}
                        className="w-5 h-5 text-primary-green focus:ring-primary-green focus:ring-2"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{payment.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{payment.label}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{payment.desc}</p>
                          </div>
                        </div>
                      </div>
                      {paymentInfo.method === payment.id && (
                        <CheckCircle className="w-6 h-6 text-primary-green" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 border-2 border-primary-green/20 lg:sticky lg:top-24 fade-in-up">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-green mb-4 sm:mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-warm-orange" />
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 group">
                          <Image
                            src={item.product.image || "/api/placeholder/64/64"}
                            alt={item.product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">{item.product.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">₱{item.product.price.toFixed(2)} each</p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-primary-green hover:text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 font-bold border border-gray-300 shadow-sm hover:shadow-md active:scale-95"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base text-gray-900 px-2 py-1 bg-white rounded-lg border border-gray-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-primary-green hover:text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 font-bold border border-gray-300 shadow-sm hover:shadow-md active:scale-95"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base sm:text-lg text-primary-green">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-gray-900">₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : `₱${shipping}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs sm:text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      ✓ You've qualified for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Tax (12%)</span>
                    <span className="font-semibold text-gray-900">₱{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl sm:text-3xl font-bold text-primary-green">₱{total.toFixed(2)}</span>
                </div>

                {error && (
                  <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm sm:text-base font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedAddress}
                  className="btn-hover w-full bg-gradient-to-r from-primary-green to-leaf-green text-white px-6 py-4 rounded-xl font-bold text-center hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-3 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold text-sm sm:text-base">Secure checkout</span>
                  </div>
                  <p className="text-xs sm:text-sm text-green-600">Your payment information is protected with encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Address Dialog */}
      <ChangeAddressDialog
        isOpen={isChangeAddressOpen}
        onClose={() => setIsChangeAddressOpen(false)}
        onSelectAddress={(address) => {
          setSelectedAddress(address);
          setIsChangeAddressOpen(false);
        }}
        currentAddressId={selectedAddress?.id}
        onAddNewAddress={() => setIsAddAddressOpen(true)}
      />

      {/* Add Address Form */}
      <AddressForm
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        onSubmit={handleAddAddress}
        mode="create"
      />
    </div>
  );
}
