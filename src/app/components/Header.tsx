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
  const { data: session } = useSession();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  const showMobileSearch = pathname === '/products' || pathname === '/recipes';

  // Typed form event handler
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

useEffect(() => {
  if (!session?.user) return;

  async function fetchData() {
    try {
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setUnreadNotifications(notifData.unreadCount);
      }

      const msgRes = await fetch('/api/chat/conversations');
      if (msgRes.ok) {
        const conversations = await msgRes.json();
        const unread = conversations.filter((conv: any) => {
          const lastMessage = conv.messages[conv.messages.length - 1];
          return (
            lastMessage?.sender?.id !== undefined &&
            lastMessage?.sender?.id !== session.user!.id
          );
        }).length;
        setUnreadMessages(unread);
      }
    } catch (err) {
      console.error(err);
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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-primary-green">
              Lawlaw Delights
            </span>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-3 bg-gray-100 px-5 py-2 rounded-full border flex-grow max-w-xl"
          >
            <Search className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search for products, recipes..."
              value={searchQuery}
              onChange={handleInputChange}
              className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
            />
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-gray-700">
              {!session && (
                <Link href="/" className="hover:text-primary-green">
                  <Home className="w-6 h-6" />
                </Link>
              )}

              <Link href="/products" className="hover:text-primary-green">
                <Boxes className="w-6 h-6" />
              </Link>
              <Link href="/recipes" className="hover:text-primary-green">
                <BookOpen className="w-6 h-6" />
              </Link>

              <Link href="/cart" className="hover:text-primary-green relative">
                <ShoppingCart className="w-6 h-6" />
              </Link>

              {session && (
                <>
                  <Link href="/notifications" className="hover:text-primary-green relative">
                    <Bell className="w-6 h-6" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>

                  <Link href="/chat" className="hover:text-primary-green relative">
                    <MessageCircle className="w-6 h-6" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {session ? (
              <Link href="/profile" className="p-1 hover:text-primary-green">
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <Link href="/login" className="hover:text-primary-green">
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
              className="flex items-center bg-gray-100 rounded-full border flex-grow px-4 py-2"
            >
              <Search className="w-5 h-5 text-gray-600 mr-2" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleInputChange}
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
              />
            </form>

            <Link href="/cart" className="relative text-gray-700">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50 md:hidden">
        <div className="flex justify-around items-center h-16 text-gray-700">
          {!session && (
            <Link href="/" className="flex flex-col items-center text-xs">
              <Home className="w-6 h-6" />
              <span className="text-[10px]">Home</span>
            </Link>
          )}

          <Link href="/products" className="flex flex-col items-center text-xs">
            <Boxes className="w-6 h-6" />
            <span className="text-[10px]">Products</span>
          </Link>

          <Link href="/recipes" className="flex flex-col items-center text-xs">
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px]">Recipes</span>
          </Link>

          {session && (
            <Link href="/chat" className="relative flex flex-col items-center text-xs">
              <MessageCircle className="w-6 h-6" />
              <span className="text-[10px]">Chat</span>
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>
          )}

          {session && (
            <Link href="/notifications" className="relative flex flex-col items-center text-xs">
              <Bell className="w-6 h-6" />
              <span className="text-[10px]">Notification</span>
            </Link>
          )}

          <Link
            href={session ? '/profile' : '/login'}
            className="flex flex-col items-center text-xs"
          >
            <User className="w-6 h-6" />
            <span className="text-[10px]">{session ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
