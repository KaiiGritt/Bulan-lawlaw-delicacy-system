'use client';

import Link from 'next/link';
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
 <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-lawlaw-silver via-white to-lawlaw-steel-blue/10 backdrop-blur-md border-b border-lawlaw-steel-blue/30 shadow-lg transition-colors duration-300">
 <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
 {/* Logo */}
 <Link href="/" className="flex items-center gap-2 flex-shrink-0">
 <img
 src="/lawlaw-delights-high-resolution-logo-transparent.png"
 alt="Lawlaw Delights Logo"
 className="h-8 sm:h-9 md:h-10 w-auto"
 />
 <span className="hidden sm:inline text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-green via-leaf-green to-soft-green bg-clip-text text-transparent">
 Lawlaw Delights
 </span>
 </Link>

 {/* Desktop Search */}
 <form
 onSubmit={handleSearch}
 className="hidden md:flex items-center gap-3 bg-soft-green/10 px-5 py-2.5 rounded-full border border-soft-green/30 flex-grow max-w-xl hover:border-primary-green/50 hover:shadow-md focus-within:border-primary-green focus-within:shadow-lg transition-all duration-300 shadow-sm"
 >
 <Search className="w-5 h-5 text-primary-green" />
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
 <Link href="/" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
 <Home className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 </Link>
 )}

 <Link href="/products" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
 <Boxes className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 </Link>
 <Link href="/recipes" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
 <BookOpen className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 </Link>

 {session?.user?.role !== 'seller' && (
 <Link href="/cart" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
 <ShoppingCart className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 </Link>
 )}

 {session && (
 <>
 <Link href="/notifications" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
 <Bell className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 {unreadNotifications > 0 && (
 <>
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg z-10">
 {unreadNotifications > 9 ? '9+' : unreadNotifications}
 </span>
 <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-2.5 w-2.5 animate-ping"></span>
 </>
 )}
 </Link>

 <Link href="/chat" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
 <MessageCircle className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 {unreadMessages > 0 && (
 <>
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg z-10">
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
 <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
 ) : (status === 'authenticated' && session) ? (
 <Link href="/profile" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md" title="Profile">
 <User className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 </Link>
 ) : (
 <Link href="/login" className="relative group p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md" title="Login">
 <LogIn className="w-6 h-6 relative z-10 group-hover:text-primary-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
 <span className="absolute inset-0 bg-gradient-to-r from-primary-green/5 to-leaf-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-green to-leaf-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
 </Link>
 )}
 </div>
 </div>

 {/* Mobile Search */}
 {showMobileSearch && (
 <div className="md:hidden px-4 pb-2 pt-2 flex items-center gap-3">
 <form
 onSubmit={handleSearch}
 className="flex items-center bg-soft-green/10 rounded-full border border-soft-green/30 flex-grow px-4 py-2 shadow-sm"
 >
 <Search className="w-5 h-5 text-primary-green mr-2" />
 <input
 type="text"
 placeholder="Search for products..."
 value={searchQuery}
 onChange={handleInputChange}
 className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
 />
 </form>

 <Link href="/cart" className="relative text-gray-700 hover:text-primary-green transition-colors">
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
 <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-accent-cream/50 to-white border-t border-soft-green/30 shadow-lg z-[100] md:hidden">
 <div className="flex justify-around items-center h-16 text-gray-600">
 {!session && (
 <Link href="/" className="relative group flex flex-col items-center text-xs active:scale-95 transition-all duration-200">
 <div className="p-2 rounded-xl group-hover:bg-primary-green/10 transition-all duration-200">
 <Home className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" />
 </div>
 <span className="text-[10px] group-hover:text-primary-green group-hover:font-medium transition-all duration-200">Home</span>
 </Link>
 )}

 <Link href="/products" className="relative group flex flex-col items-center text-xs active:scale-95 transition-all duration-200">
 <div className="p-2 rounded-xl group-hover:bg-primary-green/10 transition-all duration-200">
 <Boxes className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" />
 </div>
 <span className="text-[10px] group-hover:text-primary-green group-hover:font-medium transition-all duration-200">Products</span>
 </Link>

 <Link href="/recipes" className="relative group flex flex-col items-center text-xs active:scale-95 transition-all duration-200">
 <div className="p-2 rounded-xl group-hover:bg-primary-green/10 transition-all duration-200">
 <BookOpen className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" />
 </div>
 <span className="text-[10px] group-hover:text-primary-green group-hover:font-medium transition-all duration-200">Recipes</span>
 </Link>

 {session && (
 <Link href="/chat" className="relative group flex flex-col items-center text-xs active:scale-95 transition-all duration-200">
 <div className="relative p-2 rounded-xl group-hover:bg-primary-green/10 transition-all duration-200">
 <MessageCircle className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" />
 {unreadMessages > 0 && (
 <>
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-lg z-10">
 {unreadMessages > 9 ? '9+' : unreadMessages}
 </span>
 <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-2 w-2 animate-ping"></span>
 </>
 )}
 </div>
 <span className="text-[10px] group-hover:text-primary-green group-hover:font-medium transition-all duration-200">Chat</span>
 </Link>
 )}

 {session && (
 <Link href="/notifications" className="relative group flex flex-col items-center text-xs active:scale-95 transition-all duration-200">
 <div className="relative p-2 rounded-xl group-hover:bg-primary-green/10 transition-all duration-200">
 <Bell className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" />
 {unreadNotifications > 0 && (
 <>
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-lg z-10">
 {unreadNotifications > 9 ? '9+' : unreadNotifications}
 </span>
 <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-2 w-2 animate-ping"></span>
 </>
 )}
 </div>
 <span className="text-[10px] group-hover:text-primary-green group-hover:font-medium transition-all duration-200">Notification</span>
 </Link>
 )}

 {status === 'loading' ? (
 <div className="flex flex-col items-center text-xs">
 <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
 <span className="text-[10px] opacity-0">...</span>
 </div>
 ) : (
 <Link
 href={(status === 'authenticated' && session) ? '/profile' : '/login'}
 className="relative group flex flex-col items-center text-xs active:scale-95 transition-all duration-200"
 title={(status === 'authenticated' && session) ? 'Profile' : 'Login'}
 >
 <div className="p-2 rounded-xl group-hover:bg-primary-green/10 transition-all duration-200">
 {(status === 'authenticated' && session) ? <User className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" /> : <LogIn className="w-6 h-6 group-hover:text-primary-green group-active:scale-90 transition-all duration-200" />}
 </div>
 <span className="text-[10px] group-hover:text-primary-green group-hover:font-medium transition-all duration-200">{(status === 'authenticated' && session) ? 'Profile' : 'Login'}</span>
 </Link>
 )}
 </div>
 </nav>
 </>
 );
}
