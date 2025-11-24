'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Lucide Icons
import {
  Search,
  BookOpen,
  ShoppingCart,
  Bell,
  MessageCircle,
  User,
  LogIn,
  Menu,
  X,
  Home,
  Boxes
} from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUnreadNotifications();
      fetchUnreadMessages();
    }
  }, [session]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifications(data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const conversations = await res.json();
        // Approximate unread messages: count conversations where the last message is not from the current user
        const unread = conversations.filter((conv: any) => {
          const lastMessage = conv.messages[conv.messages.length - 1];
          return lastMessage && lastMessage.sender.id !== session?.user.id;
        }).length;
        setUnreadMessages(unread);
      }
    } catch (err) {
      console.error('Error fetching unread messages:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
          <span className="text-2xl font-bold text-primary-green">Lawlaw Delights</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border"
          >
            <Search className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-44 text-gray-700"
            />
          </form>

          {/* Quick Links */}
          <div className="flex items-center gap-5 text-gray-700">
            <Link href="/" className="flex items-center hover:text-primary-green">
              <Home className="w-6 h-6" />
            </Link>
            <Link href="/products" className="flex items-center hover:text-primary-green">
              <Boxes className="w-6 h-6" />
            </Link>
            <Link href="/recipes" className="hover:text-primary-green">
              <BookOpen className="w-6 h-6" />
            </Link>
            <Link href="/cart" className="hover:text-primary-green">
              <ShoppingCart className="w-6 h-6" />
            </Link>

            {/* Messages (only if logged in) */}
            {session && (
              <div className="relative">
                <Link href="/notifications" className="hover:text-primary-green">
                  <Bell className="w-6 h-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>
              </div>
            )}
            <div className="relative">
              <Link href="/chat" className="hover:text-primary-green">
                <MessageCircle className="w-6 h-6" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Profile Section */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hover:text-primary-green"
              >
                <User className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-xl border shadow-xl py-3"
                  >
                    {/* User Info */}
                    <div className="px-4 pb-3 border-b">
                      <p className="font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col py-2">
                      {session.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <Link href="/profile" className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                        My Account
                      </Link>

                      <Link href="/help" className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                        Help Center
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className="text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" className="hover:text-primary-green">
              <LogIn className="w-6 h-6" />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-primary-green p-2"
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white shadow-md border-t"
          >
            <nav className="flex flex-col px-6 py-5 gap-4 text-gray-700 text-lg">

              <Link href="/" onClick={toggleMobileMenu}>Home</Link>
              <Link href="/products" onClick={toggleMobileMenu}>Products</Link>
              <Link href="/recipes" onClick={toggleMobileMenu}>Recipes</Link>
              <Link href="/cart" onClick={toggleMobileMenu}>Cart</Link>

              {session ? (
                <>
                      {session.user?.role === 'admin' && (
                        <Link href="/admin" onClick={toggleMobileMenu}>Admin Dashboard</Link>
                      )}

                      {session.user?.role === 'seller' && (
                        <Link href="/seller" onClick={toggleMobileMenu}>Seller Dashboard</Link>
                      )}
                  <Link href="/profile" onClick={toggleMobileMenu}>My Account</Link>

                  <button
                    onClick={() => signOut()}
                    className="text-left text-red-600 font-medium mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={toggleMobileMenu} className="font-medium text-primary-green">
                  Login
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
