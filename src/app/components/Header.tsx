import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
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
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">Home</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">Products</Link>
          <Link href="/recipes" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">Recipes</Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">Contact</Link>
          <Link href="/cart" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">Cart</Link>
          <Link href="/login" className="text-gray-700 hover:text-primary-green transition-colors duration-300 font-medium">Login</Link>
        </nav>
        {/* Mobile menu button */}
        <button className="md:hidden text-primary-green">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
