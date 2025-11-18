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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Always empty cart

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Always show empty cart state
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
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
