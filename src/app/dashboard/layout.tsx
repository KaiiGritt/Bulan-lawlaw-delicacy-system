'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50">
      {/* Header - Using same styling as main Header */}
      <header className="glassmorphism sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
            <Image
              src="/logo.png"
              alt="Lawlaw Delights Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-primary-green hover:text-leaf-green transition-colors duration-300">
              Lawlaw Delights
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">
              Dashboard
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">
              Shop
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">
              Orders
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">
              Profile
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {session?.user?.name || 'User'}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © 2024 Lawlaw Delights. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
