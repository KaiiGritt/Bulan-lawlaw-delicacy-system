'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else fetchOrders();
  }, [session, status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancellationReason }),
      });

      if (res.ok) {
        toast.success('Cancellation request submitted');
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancellationReason('');
        fetchOrders(); // Refresh orders
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'processing'].includes(order.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-green"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-green dark:text-green-300">My Orders</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Track and manage your order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-leaf-green transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-green dark:text-green-300">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelModal(true);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {order.cancellationReason && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Cancellation Reason:</strong> {order.cancellationReason}
                    </p>
                    {order.cancelledAt && (
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Payment: {order.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Total: ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-leaf-green transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/chat?orderId=${order.id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Contact Sellers
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Cancel Order #{selectedOrder.id.slice(-8)}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Please provide a reason for cancellation:
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
                rows={4}
                required
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedOrder(null);
                    setCancellationReason('');
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancellationReason.trim()}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
