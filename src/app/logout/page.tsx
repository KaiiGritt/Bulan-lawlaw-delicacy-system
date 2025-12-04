'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutPage() {
 useEffect(() => {
 const handleLogout = async () => {
 // Clear all storage first
 if (typeof window !== 'undefined') {
 localStorage.clear();
 sessionStorage.clear();

 // Clear all cookies
 document.cookie.split(";").forEach((c) => {
 document.cookie = c
 .replace(/^ +/, "")
 .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
 });
 }

 // Sign out with NextAuth
 await signOut({
 redirect: true,
 callbackUrl: '/login'
 });
 };

 handleLogout();
 }, []);

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
 <p className="text-gray-600">Logging out...</p>
 </div>
 </div>
 );
}
