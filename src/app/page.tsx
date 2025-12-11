'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronLeft, ChevronRight, Star, Clock, Flame, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  stock: number;
  featured: boolean;
  createdAt: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  image: string;
}

const heroSlides = [
  {
    title: "Fresh from the Sea",
    subtitle: "Authentic Lawlaw Delicacies",
    description: "Discover the finest seafood treasures from Bulan, Sorsogon. Fresh, sustainable, and bursting with Filipino flavor.",
    cta: "Shop Now",
    ctaLink: "/products",
    bgGradient: "from-lawlaw-steel-blue via-lawlaw-aqua-teal to-lawlaw-ocean-teal",
  },
  {
    title: "Cook Like a Pro",
    subtitle: "Traditional Filipino Recipes",
    description: "Master the art of cooking Lawlaw with our step-by-step guides and authentic recipes passed down through generations.",
    cta: "Explore Recipes",
    ctaLink: "/recipes",
    bgGradient: "from-lawlaw-ocean-teal via-lawlaw-deep-blue to-lawlaw-navy",
  },
  {
    title: "Premium Quality",
    subtitle: "Handpicked Selection",
    description: "Every product is carefully selected from our trusted fishermen partners to ensure the highest quality for your family.",
    cta: "View Products",
    ctaLink: "/products",
    bgGradient: "from-lawlaw-deep-blue via-lawlaw-steel-blue to-lawlaw-aqua-teal",
  },
];

export default function Home() {
  const { data: session } = useSession();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, recipesRes] = await Promise.all([
          fetch('/api/products').catch(() => null),
          fetch('/api/recipes').catch(() => null)
        ]);

        if (productsRes?.ok) {
          try {
            const products: Product[] = await productsRes.json();
            if (Array.isArray(products)) {
              // Featured products
              const featured = products.filter(p => p.featured).slice(0, 4);
              setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 4));

              // Best sellers (highest rated)
              const sorted = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
              setBestSellers(sorted.slice(0, 4));

              // New arrivals (most recent)
              const byDate = [...products].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setNewArrivals(byDate.slice(0, 4));
            }
          } catch {
            // Silently handle JSON parse errors
          }
        }

        if (recipesRes?.ok) {
          try {
            const recipes = await recipesRes.json();
            if (Array.isArray(recipes)) {
              setFeaturedRecipes(recipes.slice(0, 3));
            }
          } catch {
            // Silently handle JSON parse errors
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!session) {
      toast.error('Please login to add items to cart');
      return;
    }

    setAddingToCart(product.id);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.ok) {
        toast.success(`${product.name} added to cart!`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const ProductCard = ({ product, badge }: { product: Product; badge?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image || "/products.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Badge */}
          {badge && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
              <span className="bg-lawlaw-ocean-teal/90 backdrop-blur-sm text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-0.5">
                {badge === 'Best Seller' && <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {badge === 'New' && <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {badge === 'Featured' && <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {badge}
              </span>
            </div>
          )}
          {/* Low Stock Badge */}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
              <span className="bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                Low Stock
              </span>
            </div>
          )}
          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info - Shopee Style */}
      <div className="p-2 sm:p-4">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px] hover:text-lawlaw-ocean-teal transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating - Compact */}
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                  star <= Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-600">
            ({product.rating ? product.rating.toFixed(1) : '0'})
          </span>
        </div>

        {/* Price - Prominent Shopee Style */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-lawlaw-ocean-teal font-bold text-sm sm:text-lg lg:text-xl">
            ₱{product.price.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">
            {product.stock} left
          </span>
        </div>

        {/* Action Buttons - Buy Now and Add to Cart */}
        <div className="flex gap-1.5 sm:gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 bg-lawlaw-aqua-teal hover:bg-lawlaw-ocean-teal text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all text-center"
          >
            <span className="hidden sm:inline">Buy Now</span>
            <span className="sm:hidden">Buy</span>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(product);
            }}
            disabled={addingToCart === product.id || product.stock === 0}
            className="flex-1 bg-lawlaw-ocean-teal hover:bg-lawlaw-deep-blue text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {addingToCart === product.id ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-200 animate-pulse"></div>
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="h-8 sm:h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-12"></div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <div className="flex-1 h-7 sm:h-9 bg-gray-200 rounded-md sm:rounded-lg animate-pulse"></div>
          <div className="flex-1 h-7 sm:h-9 bg-gray-200 rounded-md sm:rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-[70vh] min-h-[500px] sm:h-[85vh] lg:h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].bgGradient}`}
          />
        </AnimatePresence>

        {/* Animated Orbs - hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-32 h-32 lg:w-48 lg:h-48 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 w-48 h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 lg:w-96 lg:h-96 bg-white/5 rounded-full blur-2xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-5 sm:px-8 lg:px-6 max-w-5xl mx-auto text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs sm:text-base md:text-lg lg:text-xl font-medium mb-2 sm:mb-3 lg:mb-4 text-white/90 tracking-wide uppercase"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed text-white/90"
              >
                {heroSlides[currentSlide].description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
              >
                <Link
                  href={heroSlides[currentSlide].ctaLink}
                  className="bg-white text-lawlaw-deep-blue px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {heroSlides[currentSlide].cta}
                </Link>
                <Link
                  href="/recipes"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-lawlaw-deep-blue transition-all duration-300"
                >
                  Learn to Cook
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation */}
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 sm:gap-4 z-20">
          <button
            onClick={prevSlide}
            className="p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button>
          <div className="flex gap-2 sm:gap-2.5">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-6 sm:w-8 bg-white' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* Scroll Indicator - hidden on mobile and tablet */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-24 lg:bottom-28 left-1/2 transform -translate-x-1/2 text-white/70 hidden lg:block"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10 lg:mb-12"
          >
            <span className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-lawlaw-ocean-teal/10 text-lawlaw-ocean-teal rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Featured Collection
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Handpicked Delicacies</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Our finest selection of Lawlaw products, chosen for exceptional quality
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} badge="Featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-10 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10 lg:mb-12"
          >
            <span className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-orange-100 text-orange-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Best Sellers
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Customer Favorites</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              The most loved products by our community
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} badge="Best Seller" />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-10 lg:mt-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Products
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10 lg:mb-12"
          >
            <span className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-purple-100 text-purple-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              New Arrivals
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Fresh Additions</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our latest products, freshly added to our collection
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} badge="New" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-lawlaw-steel-blue/5 to-lawlaw-aqua-teal/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10 lg:mb-12"
          >
            <span className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-lawlaw-ocean-teal/10 text-lawlaw-ocean-teal rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Recipe Collection
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Culinary Adventures</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Master the art of Filipino cooking with our step-by-step guides
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg sm:rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2">
                    <div className="h-8 sm:h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-7 sm:h-9 bg-gray-200 rounded-md sm:rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {featuredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="block bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] group"
                  >
                    {/* Recipe Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={recipe.image || "/products.png"}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700 ease-out"
                      />
                      {/* Difficulty Badge */}
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${
                          recipe.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
                          recipe.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Recipe Info - Shopee Style */}
                    <div className="p-2 sm:p-4">
                      {/* Recipe Title */}
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                        {recipe.title}
                      </h3>

                      {/* Time Info - Compact */}
                      <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          {recipe.prepTime + recipe.cookTime} min total
                        </span>
                      </div>

                      {/* Time Details - Shopee Style */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                          <span>Prep: {recipe.prepTime}m</span>
                          <span>•</span>
                          <span>Cook: {recipe.cookTime}m</span>
                        </div>
                      </div>

                      {/* View Recipe Button - Mobile Optimized */}
                      <div
                        className="w-full bg-lawlaw-ocean-teal hover:bg-lawlaw-deep-blue text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 hover:shadow-lg"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="hidden sm:inline">Start Cooking</span>
                        <span className="sm:hidden">Cook</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-10 lg:mt-12"
          >
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-white text-lawlaw-deep-blue border-2 border-lawlaw-ocean-teal px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-lawlaw-ocean-teal hover:text-white transition-all duration-300 shadow-lg"
            >
              Explore All Recipes
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-lawlaw-deep-blue via-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 lg:mb-6">Join Our Culinary Community</h2>
            <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow food enthusiasts, share your Lawlaw creations, and discover new ways to enjoy this Filipino delicacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              {!session ? (
                <>
                  <Link
                    href="/register"
                    className="bg-white text-lawlaw-deep-blue px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Join Community
                  </Link>
                  <Link
                    href="/login"
                    className="bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-lawlaw-deep-blue transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/products"
                  className="bg-white text-lawlaw-deep-blue px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-16 md:h-0" />
    </div>
  );
}
