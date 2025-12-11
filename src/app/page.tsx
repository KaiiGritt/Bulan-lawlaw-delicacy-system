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
      className="group bg-white rounded-lg sm:rounded-2xl shadow-sm sm:shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300"
    >
      {/* Shopee-style compact image for mobile */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square sm:h-56 overflow-hidden">
          <Image
            src={product.image || "/products.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
          />
          {badge && (
            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-sm sm:rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
              {badge === 'Best Seller' && <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {badge === 'New' && <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {badge}
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      {/* Shopee-style compact info for mobile */}
      <div className="p-2 sm:p-5">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-lg font-medium sm:font-semibold text-gray-900 mb-0.5 sm:mb-1 line-clamp-2 sm:line-clamp-1 leading-tight min-h-[32px] sm:min-h-0">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-[10px] sm:text-sm mb-1.5 sm:mb-4 line-clamp-1 sm:line-clamp-2 hidden sm:block">
          {product.description}
        </p>
        {/* Mobile price and rating row - Shopee style */}
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-lawlaw-ocean-teal font-bold text-sm sm:text-lg">
            ₱{product.price.toLocaleString()}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-gray-500">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {/* Mobile: simple add to cart button, Desktop: full buttons */}
        <div className="flex gap-1.5 sm:gap-2">
          <Link
            href={`/products/${product.id}`}
            className="hidden sm:flex flex-1 text-center py-2.5 px-4 rounded-xl border-2 border-lawlaw-ocean-teal text-lawlaw-ocean-teal font-medium hover:bg-lawlaw-ocean-teal hover:text-white transition-all duration-300 items-center justify-center"
          >
            View Details
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(product);
            }}
            disabled={addingToCart === product.id || product.stock === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 py-1.5 sm:p-2.5 rounded-md sm:rounded-xl bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white text-[10px] sm:text-sm font-medium hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart === product.id ? (
              <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5" />
                <span className="sm:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm sm:shadow-lg overflow-hidden border border-gray-100">
      <div className="aspect-square sm:h-56 bg-gray-200 animate-pulse"></div>
      <div className="p-2 sm:p-5 space-y-1.5 sm:space-y-3">
        <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-full hidden sm:block"></div>
        <div className="h-4 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="flex gap-1.5 sm:gap-2">
          <div className="flex-1 h-7 sm:h-10 bg-gray-200 rounded-md sm:rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-[85vh] sm:h-screen flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto text-white">
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
                className="text-sm sm:text-lg md:text-xl font-medium mb-2 sm:mb-4 text-white/90"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 leading-tight"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm sm:text-xl md:text-2xl mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed text-white/90 px-2"
              >
                {heroSlides[currentSlide].description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              >
                <Link
                  href={heroSlides[currentSlide].ctaLink}
                  className="bg-white text-lawlaw-deep-blue px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {heroSlides[currentSlide].cta}
                </Link>
                <Link
                  href="/recipes"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:bg-white hover:text-lawlaw-deep-blue transition-all duration-300"
                >
                  Learn to Cook
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4 z-20">
          <button
            onClick={prevSlide}
            className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <div className="flex gap-1.5 sm:gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scroll Indicator - hidden on mobile */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 text-white/70 hidden sm:block"
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
      <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-12"
          >
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-lawlaw-ocean-teal/10 text-lawlaw-ocean-teal rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              ⭐ Featured Collection
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Handpicked Delicacies</h2>
            <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Our finest selection of Lawlaw products, chosen for exceptional quality
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} badge="Featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-12"
          >
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              🔥 Best Sellers
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Customer Favorites</h2>
            <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto">
              The most loved products by our community
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} badge="Best Seller" />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Products
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-12"
          >
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-purple-100 text-purple-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              ✨ New Arrivals
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Fresh Additions</h2>
            <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our latest products, freshly added to our collection
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} badge="New" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-lawlaw-steel-blue/5 to-lawlaw-aqua-teal/10">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-12"
          >
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-lawlaw-ocean-teal/10 text-lawlaw-ocean-teal rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              👨‍🍳 Recipe Collection
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Culinary Adventures</h2>
            <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Master the art of Filipino cooking with our step-by-step guides
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg sm:rounded-2xl shadow-sm sm:shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] sm:h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-2 sm:p-6 space-y-1.5 sm:space-y-3">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-full hidden sm:block"></div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded-md sm:rounded-xl animate-pulse w-full sm:w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
              {featuredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-lg sm:rounded-2xl shadow-sm sm:shadow-lg overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300"
                >
                  <Link href={`/recipes/${recipe.id}`} className="block">
                    <div className="relative aspect-[4/3] sm:h-48 overflow-hidden">
                      <Image
                        src={recipe.image || "/products.png"}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-sm sm:rounded-full text-[10px] sm:text-sm font-medium text-lawlaw-deep-blue">
                        {recipe.difficulty}
                      </div>
                      <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-sm sm:rounded-full text-[10px] sm:text-sm font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        {recipe.prepTime + recipe.cookTime}m
                      </div>
                    </div>
                  </Link>
                  <div className="p-2 sm:p-6">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3 className="text-xs sm:text-xl font-medium sm:font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 leading-tight min-h-[32px] sm:min-h-0">{recipe.title}</h3>
                    </Link>
                    <p className="text-gray-600 mb-2 sm:mb-4 line-clamp-2 text-[10px] sm:text-base hidden sm:block">{recipe.description}</p>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-3 py-1.5 sm:px-6 sm:py-3 rounded-md sm:rounded-xl text-[10px] sm:text-base font-medium hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300 w-full sm:w-auto"
                    >
                      View Recipe
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-white text-lawlaw-deep-blue border-2 border-lawlaw-ocean-teal px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:bg-lawlaw-ocean-teal hover:text-white transition-all duration-300 shadow-lg"
            >
              Explore All Recipes
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-lawlaw-deep-blue via-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-6">Join Our Culinary Community</h2>
            <p className="text-sm sm:text-xl mb-6 sm:mb-8 text-white/90 px-2">
              Connect with fellow food enthusiasts, share your Lawlaw creations, and discover new ways to enjoy this Filipino delicacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {!session ? (
                <>
                  <Link
                    href="/register"
                    className="bg-white text-lawlaw-deep-blue px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                  >
                    Join Community
                  </Link>
                  <Link
                    href="/login"
                    className="bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:bg-white hover:text-lawlaw-deep-blue transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/products"
                  className="bg-white text-lawlaw-deep-blue px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
