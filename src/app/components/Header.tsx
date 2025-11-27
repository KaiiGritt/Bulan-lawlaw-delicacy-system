'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Home,
  Boxes,
  BookOpen,
  ShoppingCart,
  User,
  Bell,
  MessageCircle,
  LogIn,
} from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  const showMobileSearch = pathname === '/products' || pathname === '/recipes';

  // Debug logging
  useEffect(() => {
    console.log('Header Debug:', { status, hasSession: !!session, sessionData: session });
  }, [status, session]);

  // Typed form event handler
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

useEffect(() => {
  if (!session?.user) return;

  type Message = {
    sender?: {
      id?: string;
    }
  };
  
  type Conversation = {
    messages: Message[];
  };

  async function fetchData() {
    try {
      const notifRes = await fetch('/api/notifications').catch(() => null);
      if (notifRes?.ok) {
        const notifData = await notifRes.json();
        setUnreadNotifications(notifData.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }

    try {
      const msgRes = await fetch('/api/chat/conversations').catch(() => null);
      if (msgRes?.ok) {
        const conversations: Conversation[] = await msgRes.json();
        const unread = conversations.filter(conv => {
          const lastMessage = conv.messages[conv.messages.length - 1];
          return (
            lastMessage?.sender?.id !== undefined &&
            session?.user != null &&
            lastMessage?.sender?.id !== session.user.id
          );
        }).length;
        setUnreadMessages(unread);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }

  fetchData();
}, [session]);


  // Input change handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-accent-cream via-white to-soft-green/10 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-md border-b border-soft-green/30 dark:border-gray-700 shadow-lg transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-green via-leaf-green to-soft-green bg-clip-text text-transparent dark:from-green-400 dark:via-green-500 dark:to-green-600">
              Lawlaw Delights
            </span>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-3 bg-soft-green/10 dark:bg-gray-800 px-5 py-2.5 rounded-full border border-soft-green/30 dark:border-gray-600 flex-grow max-w-xl hover:border-primary-green/40 transition-colors shadow-sm"
          >
            <Search className="w-5 h-5 text-primary-green dark:text-green-400" />
            <input
              type="text"
              placeholder="Search for products, recipes..."
              value={searchQuery}
              onChange={handleInputChange}
              className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-gray-700 dark:text-gray-300">
              {!session && (
                <Link href="/" className="hover:text-primary-green dark:hover:text-green-400 transition-colors">
                  <Home className="w-6 h-6" />
                </Link>
              )}

              <Link href="/products" className="hover:text-primary-green dark:hover:text-green-400 transition-colors">
                <Boxes className="w-6 h-6" />
              </Link>
              <Link href="/recipes" className="hover:text-primary-green dark:hover:text-green-400 transition-colors">
                <BookOpen className="w-6 h-6" />
              </Link>

              <Link href="/cart" className="hover:text-primary-green dark:hover:text-green-400 transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
              </Link>

              {session && (
                <>
                  <Link href="/notifications" className="hover:text-primary-green dark:hover:text-green-400 transition-colors relative">
                    <Bell className="w-6 h-6" />
                    {unreadNotifications > 0 && (
                      <>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-2.5 w-2.5 animate-ping"></span>
                      </>
                    )}
                  </Link>

                  <Link href="/chat" className="hover:text-primary-green dark:hover:text-green-400 transition-colors relative">
                    <MessageCircle className="w-6 h-6" />
                    {unreadMessages > 0 && (
                      <>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-2.5 w-2.5 animate-ping"></span>
                      </>
                    )}
                  </Link>
                </>
              )}
            </div>

            {status === 'loading' ? (
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (status === 'authenticated' && session) ? (
              <Link href="/profile" className="p-1 hover:text-primary-green dark:hover:text-green-400 transition-colors" title="Profile">
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <Link href="/login" className="hover:text-primary-green dark:hover:text-green-400 transition-colors" title="Login">
                <LogIn className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-2 pt-2 flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-soft-green/10 dark:bg-gray-800 rounded-full border border-soft-green/30 dark:border-gray-600 flex-grow px-4 py-2 shadow-sm"
            >
              <Search className="w-5 h-5 text-primary-green dark:text-green-400 mr-2" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleInputChange}
                className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </form>

            <Link href="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-primary-green dark:hover:text-green-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {session && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              )}
            </Link>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-accent-cream/50 to-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-soft-green/30 dark:border-gray-700 shadow-lg z-50 md:hidden">
        <div className="flex justify-around items-center h-16 text-gray-600 dark:text-gray-300">
          {!session && (
            <Link href="/" className="flex flex-col items-center text-xs hover:text-primary-green dark:hover:text-green-400 transition-colors">
              <Home className="w-6 h-6" />
              <span className="text-[10px]">Home</span>
            </Link>
          )}

          <Link href="/products" className="flex flex-col items-center text-xs hover:text-primary-green dark:hover:text-green-400 transition-colors">
            <Boxes className="w-6 h-6" />
            <span className="text-[10px]">Products</span>
          </Link>

          <Link href="/recipes" className="flex flex-col items-center text-xs hover:text-primary-green dark:hover:text-green-400 transition-colors">
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px]">Recipes</span>
          </Link>

          {session && (
            <Link href="/chat" className="relative flex flex-col items-center text-xs hover:text-primary-green dark:hover:text-green-400 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-[10px]">Chat</span>
              {unreadMessages > 0 && (
                <>
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-lg z-10">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                  <span className="absolute -top-0.5 -right-1.5 bg-red-500 rounded-full h-2 w-2 animate-ping"></span>
                </>
              )}
            </Link>
          )}

          {session && (
            <Link href="/notifications" className="relative flex flex-col items-center text-xs hover:text-primary-green dark:hover:text-green-400 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="text-[10px]">Notification</span>
              {unreadNotifications > 0 && (
                <>
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-lg z-10">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                  <span className="absolute -top-0.5 -right-1.5 bg-red-500 rounded-full h-2 w-2 animate-ping"></span>
                </>
              )}
            </Link>
          )}

          {status === 'loading' ? (
            <div className="flex flex-col items-center text-xs">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <span className="text-[10px] opacity-0">...</span>
            </div>
          ) : (
            <Link
              href={(status === 'authenticated' && session) ? '/profile' : '/login'}
              className="flex flex-col items-center text-xs hover:text-primary-green dark:hover:text-green-400 transition-colors"
              title={(status === 'authenticated' && session) ? 'Profile' : 'Login'}
            >
              {(status === 'authenticated' && session) ? <User className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
              <span className="text-[10px]">{(status === 'authenticated' && session) ? 'Profile' : 'Login'}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
