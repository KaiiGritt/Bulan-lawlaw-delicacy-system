'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AddToCartModal from '../components/AddToCartModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'fresh' | 'dried' | 'processed';
  image: string;
  stock: number;
  user: {
    id: string;
    name: string;
    email: string;
    sellerApplication: {
      businessName: string;
    } | null;
  };
  rating: number;
  comments: Array<{
    id: string;
    content: string;
    rating: number;
    user: { name: string };
    createdAt: string;
  }>;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      });

      if (response.ok) {
        const product = products.find(p => p.id === productId);
        if (product) {
          setAddedProduct(product);
          setShowCartModal(true);
        }
      } else if (response.status === 401) {
        alert('Please login to add items to cart');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const categories = ['All', 'Fresh', 'Dried', 'Processed'];
  let filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory.toLowerCase());

  // Apply search filter if search query exists
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.user.name.toLowerCase().includes(query) ||
      (product.user.sellerApplication?.businessName?.toLowerCase().includes(query))
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:bg-gray-950 py-8 sm:py-12 relative">
      {/* Animated background for dark mode */}
      <div className="absolute inset-0 hidden dark:block overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="pulsing-orb absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
        <div className="floating-orb absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '6s' }}></div>
      </div>
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-16 fade-in-up">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green dark:text-green-400 mb-3 sm:mb-4 px-2">
              Our Lawlaw Delicacies
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Discover the finest selection of fresh and processed Lawlaw products from trusted fishermen in Bulan
            </p>
          </div>
        </div>

        {/* Category Filter - Mobile Responsive */}
        <div className="flex justify-center mb-6 sm:mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg border border-white/20 dark:border-gray-700/20 w-full sm:w-auto">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary-green dark:bg-green-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-primary-green dark:hover:text-green-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="relative aspect-square bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid - Shopee Style */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Product Image */}
              <div className="relative aspect-square image-overlay group overflow-hidden">
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Badge */}
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                  <span className="bg-primary-green/90 backdrop-blur-sm text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                </div>
                {/* Low Stock Badge */}
                {product.stock < 10 && (
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
                    <span className="bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                      Low Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info - Shopee Style */}
              <div className="p-2 sm:p-4">
                {/* Product Name */}
                <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                  {product.name}
                </h3>

                {/* Business Name */}
                {product.user.sellerApplication?.businessName && (
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 truncate">
                    {product.user.sellerApplication.businessName}
                  </p>
                )}

                {/* Rating - Compact */}
                <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                          star <= Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    ({product.comments?.length || 0})
                  </span>
                </div>

                {/* Price - Prominent Shopee Style */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-warm-orange font-bold text-sm sm:text-lg lg:text-xl">
                      ₱{product.price}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {product.stock} left
                  </span>
                </div>

                {/* Add to Cart Button - Mobile Optimized */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product.id);
                  }}
                  disabled={addingToCart === product.id}
                  className="w-full mt-2 sm:mt-3 bg-primary-green hover:bg-leaf-green text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
                >
                  {addingToCart === product.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8" />
                      </svg>
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🐟</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">Try selecting a different category</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="bg-primary-green dark:bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-leaf-green dark:hover:bg-green-500 transition-colors duration-300 text-sm sm:text-base"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Call to Action - Mobile Optimized */}
        <div className="text-center mt-8 sm:mt-16 px-3 sm:px-0">
          <div className="bg-primary-green dark:bg-green-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 opacity-90">
              Contact our fishermen directly or check back later for fresh arrivals
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-primary-green dark:text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-accent-cream dark:hover:bg-gray-100 transition-colors duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Add to Cart Success Modal */}
      {addedProduct && (
        <AddToCartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          productName={addedProduct.name}
          productImage={addedProduct.image}
          quantity={1}
        />
      )}
    </div>
  );
}
