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
      className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={product.image || "/products.png"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {badge && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            {badge === 'Best Seller' && <Flame className="w-3 h-3" />}
            {badge === 'New' && <Sparkles className="w-3 h-3" />}
            {badge}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-lawlaw-deep-blue px-3 py-1 rounded-full text-sm font-bold shadow-md">
          ₱{product.price.toLocaleString()}
        </div>
        {product.rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {product.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 text-center py-2.5 px-4 rounded-xl border-2 border-lawlaw-ocean-teal text-lawlaw-ocean-teal font-medium hover:bg-lawlaw-ocean-teal hover:text-white transition-all duration-300"
          >
            View Details
          </Link>
          <button
            onClick={() => handleAddToCart(product)}
            disabled={addingToCart === product.id || product.stock === 0}
            className="p-2.5 rounded-xl bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart === product.id ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="relative h-56 bg-gray-200 animate-pulse"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
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

        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
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
                className="text-lg md:text-xl font-medium mb-4 text-white/90"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/90"
              >
                {heroSlides[currentSlide].description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href={heroSlides[currentSlide].ctaLink}
                  className="bg-white text-lawlaw-deep-blue px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {heroSlides[currentSlide].cta}
                </Link>
                <Link
                  href="/recipes"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-lawlaw-deep-blue transition-all duration-300"
                >
                  Learn to Cook
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white/70"
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
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-lawlaw-ocean-teal/10 text-lawlaw-ocean-teal rounded-full text-sm font-semibold mb-4">
              ⭐ Featured Collection
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Handpicked Delicacies</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our finest selection of Lawlaw products, chosen for exceptional quality
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} badge="Featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              🔥 Best Sellers
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Favorites</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The most loved products by our community
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} badge="Best Seller" />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Products
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
              ✨ New Arrivals
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fresh Additions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our latest products, freshly added to our collection
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} badge="New" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-20 bg-gradient-to-br from-lawlaw-steel-blue/5 to-lawlaw-aqua-teal/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-lawlaw-ocean-teal/10 text-lawlaw-ocean-teal rounded-full text-sm font-semibold mb-4">
              👨‍🍳 Recipe Collection
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Culinary Adventures</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master the art of Filipino cooking with our step-by-step guides
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={recipe.image || "/products.png"}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-lawlaw-deep-blue">
                      {recipe.difficulty}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {recipe.prepTime + recipe.cookTime} mins
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white px-6 py-3 rounded-xl font-medium hover:from-lawlaw-deep-blue hover:to-lawlaw-ocean-teal transition-all duration-300"
                    >
                      Start Cooking
                      <ChevronRight className="w-4 h-4" />
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
            className="text-center mt-12"
          >
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-white text-lawlaw-deep-blue border-2 border-lawlaw-ocean-teal px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-lawlaw-ocean-teal hover:text-white transition-all duration-300 shadow-lg"
            >
              Explore All Recipes
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-lawlaw-deep-blue via-lawlaw-ocean-teal to-lawlaw-aqua-teal text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Join Our Culinary Community</h2>
            <p className="text-xl mb-8 text-white/90">
              Connect with fellow food enthusiasts, share your Lawlaw creations, and discover new ways to enjoy this Filipino delicacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <>
                  <Link
                    href="/register"
                    className="bg-white text-lawlaw-deep-blue px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                  >
                    Join Community
                  </Link>
                  <Link
                    href="/login"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-lawlaw-deep-blue transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/products"
                  className="bg-white text-lawlaw-deep-blue px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
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
