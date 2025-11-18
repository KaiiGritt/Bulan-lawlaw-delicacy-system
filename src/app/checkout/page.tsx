'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
}

interface PaymentInfo {
  method: 'cod' | 'gcash' | 'card';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

// Mock cart data - in a real app, this would come from context/state management
const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Fresh Lawlaw',
    price: 150,
    quantity: 2,
    image: '/images/fresh-lawlaw.jpg',
  },
  {
    id: '2',
    name: 'Dried Lawlaw',
    price: 200,
    quantity: 1,
    image: '/images/dried-lawlaw.jpg',
  },
];

export default function CheckoutPage() {
  const [cartItems] = useState<CartItem[]>(mockCartItems);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ method: 'cod' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + shipping + tax;

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (method: 'cod' | 'gcash' | 'card') => {
    setPaymentInfo({ method });
  };

  const handlePlaceOrder = async () => {
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'province', 'zipCode'];
    const isValid = requiredFields.every(field => customerInfo[field as keyof CustomerInfo].trim() !== '');

    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Mock order processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderPlaced(true);
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-primary-green mb-4">Order Placed Successfully!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-primary-green mb-4">Order Summary</h2>
              <div className="text-left space-y-2">
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 fade-in-up">
          <h1 className="text-4xl font-bold text-primary-green mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order for Lawlaw delicacies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items Review */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 fade-in-up">
              <h2 className="text-2xl font-bold text-primary-green mb-6">Review Your Order</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={item.image || "/api/placeholder/64/64"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-green">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-green">₱{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 fade-in-up">
              <h2 className="text-2xl font-bold text-primary-green mb-6">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="Street address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                  <input
                    type="text"
                    value={customerInfo.province}
                    onChange={(e) => handleCustomerInfoChange('province', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleCustomerInfoChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    required
                  />
                </div>
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

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
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
    </div>
  );
}
