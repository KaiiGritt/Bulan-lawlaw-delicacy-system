'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem('prefers-dark');
    return val ? val === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else fetchNotifications();
  }, [session, status]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('prefers-dark', dark ? 'true' : 'false');
  }, [dark]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId?: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');

      if (notificationId) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
      toast.success('Notifications marked as read');
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Failed to mark as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'seller_approval':
        return '✅';
      case 'order_update':
        return '📦';
      case 'product_approved':
        return '🛒';
      case 'product_rejected':
        return '❌';
      default:
        return '🔔';
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-green"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-green dark:text-green-300">Notifications</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-leaf-green transition-colors"
              >
                Mark All as Read
              </button>
            )}
            <button onClick={() => setDark(!dark)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No notifications yet</h3>
            <p className="text-gray-500 dark:text-gray-400">We'll notify you when there's something new!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl shadow-sm border transition-all ${
                  notification.isRead
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          notification.isRead
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-primary-green dark:text-green-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 text-sm bg-primary-green text-white rounded-lg hover:bg-leaf-green transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
