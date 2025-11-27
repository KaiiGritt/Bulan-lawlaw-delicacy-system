'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
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
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 relative">
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
 <div className="pulsing-orb absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
 </div>
 <div className="container mx-auto px-4 relative z-10">
 <div className="max-w-6xl mx-auto">
 {/* Header Skeleton */}
 <div className="mb-8 animate-pulse">
 <div className="h-10 bg-gray-200 rounded w-40 mb-4"></div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Checkout Form Skeleton */}
 <div className="lg:col-span-2 space-y-6">
 {/* Shipping Address Section */}
 <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
 <div className="space-y-4">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
 ))}
 </div>
 </div>

 {/* Payment Method Section */}
 <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
 <div className="space-y-3">
 {[1, 2].map((i) => (
 <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
 ))}
 </div>
 </div>
 </div>

 {/* Order Summary Skeleton */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24 animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-36 mb-6"></div>
 <div className="space-y-4 mb-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="flex gap-4">
 <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 </div>
 ))}
 </div>
 <div className="border-t pt-4 mb-6 space-y-3">
 <div className="flex justify-between">
 <div className="h-5 bg-gray-200 rounded w-20"></div>
 <div className="h-5 bg-gray-200 rounded w-24"></div>
 </div>
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
 You need items in your cart to proceed to checkout.
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

 if (orderPlaced) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 relative">
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="pulsing-orb absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
 <div className="floating-orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
 </div>
 <div className="container mx-auto px-4 relative z-10">
 <div className="max-w-2xl mx-auto text-center py-16">
 <div className="text-6xl mb-6">🎉</div>
 <h1 className="text-4xl font-bold text-primary-green mb-4">Order Placed Successfully!</h1>
 <p className="text-xl text-gray-600 mb-8">
 Thank you for your order. We&apos;ll send you a confirmation email shortly.
 </p>
 <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
 <h2 className="text-2xl font-bold text-primary-green mb-4">Order Summary</h2>
 <div className="text-left space-y-2 text-gray-900">
 <p><strong>Order ID:</strong> #LD-{Date.now()}</p>
 <p><strong>Total:</strong> ₱{total}</p>
 <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
 </div>
 </div>
 <Link
 href="/products"
 className="btn-hover inline-block bg-primary-green text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-leaf-green transition-colors duration-300"
 >
 Continue Shopping
 </Link>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 relative">
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 left-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
 <div className="pulsing-orb absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '5s' }}></div>
 <div className="floating-orb absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '8s' }}></div>
 </div>
 <div className="container mx-auto px-4 relative z-10">
 <div className="mb-8 fade-in-up">
 <h1 className="text-4xl font-bold text-primary-green mb-2">Checkout</h1>
 <p className="text-gray-600">Complete your order for Lawlaw delicacies</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Main Content */}
 <div className="lg:col-span-2 space-y-8">
 {/* Delivery Address Section */}
 <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 fade-in-up">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-2xl font-bold text-primary-green flex items-center gap-2">
 <MapPin className="text-orange-500" />
 Delivery Address
 </h2>
 <button
 onClick={() => setIsChangeAddressOpen(true)}
 className="text-orange-600 hover:text-orange-700 font-medium"
 >
 Change
 </button>
 </div>

 {selectedAddress ? (
 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
 <div className="flex items-start justify-between mb-2">
 <div>
 <h3 className="font-semibold text-lg">{selectedAddress.fullName}</h3>
 <p className="text-gray-600 text-sm">{selectedAddress.phoneNumber}</p>
 </div>
 {selectedAddress.isDefault && (
 <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
 Default
 </span>
 )}
 </div>
 <p className="text-sm text-gray-700">
 {selectedAddress.streetAddress}, {selectedAddress.barangay}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.region} {selectedAddress.postalCode}
 </p>
 {selectedAddress.landmark && (
 <p className="text-sm text-gray-500 mt-1">
 Landmark: {selectedAddress.landmark}
 </p>
 )}
 </div>
 ) : (
 <div className="text-center py-8 bg-gray-50 rounded-lg">
 <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
 <p className="text-gray-600 mb-4">No delivery address selected</p>
 <button
 onClick={() => setIsAddAddressOpen(true)}
 className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
 >
 Add Address
 </button>
 </div>
 )}
 </div>

 {/* Cart Items Review */}
 <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 fade-in-up">
 <h2 className="text-2xl font-bold text-primary-green mb-6">Review Your Order</h2>
 <div className="space-y-4">
 {cartItems.map((item) => (
 <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
 <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
 <Image
 src={item.product.image || "/api/placeholder/64/64"}
 alt={item.product.name}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1">
 <h3 className="font-semibold text-primary-green">{item.product.name}</h3>
 <p className="text-gray-600">Quantity: {item.quantity}</p>
 </div>
 <div className="text-right">
 <p className="font-bold text-primary-green">₱{item.product.price * item.quantity}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Payment Method */}
 <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 fade-in-up">
 <h2 className="text-2xl font-bold text-primary-green mb-6">Payment Method</h2>
 <div className="space-y-4">
 <div className="flex items-center">
 <input
 type="radio"
 id="cod"
 name="payment"
 value="cod"
 checked={paymentInfo.method === 'cod'}
 onChange={() => handlePaymentChange('cod')}
 className="w-4 h-4 text-primary-green focus:ring-primary-green"
 />
 <label htmlFor="cod" className="ml-3 text-gray-700 font-medium">
 Cash on Delivery
 </label>
 </div>
 <div className="flex items-center">
 <input
 type="radio"
 id="gcash"
 name="payment"
 value="gcash"
 checked={paymentInfo.method === 'gcash'}
 onChange={() => handlePaymentChange('gcash')}
 className="w-4 h-4 text-primary-green focus:ring-primary-green"
 />
 <label htmlFor="gcash" className="ml-3 text-gray-700 font-medium">
 GCash
 </label>
 </div>
 <div className="flex items-center">
 <input
 type="radio"
 id="card"
 name="payment"
 value="card"
 checked={paymentInfo.method === 'card'}
 onChange={() => handlePaymentChange('card')}
 className="w-4 h-4 text-primary-green focus:ring-primary-green"
 />
 <label htmlFor="card" className="ml-3 text-gray-700 font-medium">
 Credit/Debit Card
 </label>
 </div>
 </div>
 </div>
 </div>

 {/* Order Summary Sidebar */}
 <div className="bg-white rounded-2xl shadow-lg p-6 h-fit border border-gray-100 fade-in-up">
 <h2 className="text-2xl font-bold text-primary-green mb-6">Order Summary</h2>

 <div className="space-y-4 mb-6">
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
 <span className="font-semibold">₱{subtotal}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Shipping</span>
 <span className="font-semibold">{shipping === 0 ? 'Free' : `₱${shipping}`}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Tax</span>
 <span className="font-semibold">₱{tax}</span>
 </div>
 <div className="border-t pt-4">
 <div className="flex justify-between items-center text-xl font-bold text-primary-green">
 <span>Total</span>
 <span>₱{total}</span>
 </div>
 </div>
 </div>

 {error && (
 <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
 <p className="text-red-700 text-sm">{error}</p>
 </div>
 )}

 <button
 onClick={handlePlaceOrder}
 disabled={isProcessing || !selectedAddress}
 className="btn-hover w-full bg-primary-green text-white px-6 py-4 rounded-xl font-semibold text-center hover:bg-leaf-green transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
 >
 {isProcessing ? 'Processing Order...' : 'Place Order'}
 </button>

 <Link
 href="/cart"
 className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors duration-300 block"
 >
 Back to Cart
 </Link>

 <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
 <div className="flex items-center space-x-2 text-green-700 mb-2">
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 <span className="font-medium">Secure checkout</span>
 </div>
 <p className="text-sm text-green-600">Your payment information is protected</p>
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
