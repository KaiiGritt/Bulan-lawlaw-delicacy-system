'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BusinessPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'fresh' | 'dried' | 'processed';
  image: string;
  stock: number;
  rating: number;
  user: {
    id: string;
    name: string;
    email: string;
    sellerApplication: {
      businessName: string;
      businessLogo: string | null;
      description: string;
      businessType: string;
      contactNumber: string;
      address: string;
    } | null;
  };
  comments: Array<{
    id: string;
    content: string;
    rating: number;
    user: { name: string };
    createdAt: string;
  }>;
}

interface SellerApplication {
  businessName: string;
  businessLogo: string | null;
  description: string;
  businessType: string;
  yearsOfExperience: number;
  certifications: string[];
  contactNumber: string;
  address: string;
}

interface BusinessData {
  user: {
    id: string;
    name: string;
    email: string;
    sellerApplication: SellerApplication | null;
  };
  products: Product[];
  stats: {
    totalProducts: number;
    averageRating: number;
    totalReviews: number;
  };
}

export default function BusinessPage({ params }: BusinessPageProps) {
  const { data: session } = useSession();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const { slug } = await params;
        const businessName = slug.replace(/-/g, ' ');

        // Fetch all products to find the business
        const response = await fetch('/api/products');
        if (response.ok) {
          const allProducts = await response.json();

          // Find products from this business
          const businessProducts = allProducts.filter((product: Product) =>
            product.user.sellerApplication?.businessName?.toLowerCase() === businessName.toLowerCase()
          );

          if (businessProducts.length > 0) {
            const sellerApplication = businessProducts[0].user.sellerApplication;
            const stats = {
              totalProducts: businessProducts.length,
              averageRating: businessProducts.reduce((acc: number, product: Product) => acc + (product.rating || 0), 0) / businessProducts.length,
              totalReviews: businessProducts.reduce((acc: number, product: Product) => acc + (product.comments?.length || 0), 0)
            };

            setBusinessData({
              user: businessProducts[0].user,
              products: businessProducts,
              stats
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [params]);

  const handleContactSeller = () => {
    if (!businessData || !session) {
      alert('Please login to contact the seller');
      return;
    }
    window.location.href = `/chat?sellerId=${businessData.user.id}`;
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert('Product added to cart!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:bg-gray-950 py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0"></div>
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="flex gap-3 mt-4">
                    <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 sm:w-32"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Skeleton */}
            <div>
              <div className="h-6 sm:h-7 bg-gray-200 dark:bg-gray-700 rounded w-36 sm:w-48 mb-4 sm:mb-6 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-2 sm:p-3 space-y-2">
                      <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Business not found</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = ['All', 'Fresh', 'Dried', 'Processed'];
  const filteredProducts = selectedCategory === 'All'
    ? businessData.products
    : businessData.products.filter(product => product.category === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Business Header - Mobile Optimized with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
              {/* Business Logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex-shrink-0"
              >
                <img
                  src={businessData.user.sellerApplication?.businessLogo || '/placeholder-business.png'}
                  alt={businessData.user.sellerApplication?.businessName}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-2xl object-cover border-4 border-primary-green dark:border-green-400 shadow-lg"
                />
              </motion.div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-primary-green dark:text-green-400 mb-2 sm:mb-3">
                  {businessData.user.sellerApplication?.businessName}
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                  {businessData.user.sellerApplication?.description || 'Fresh seafood products from local fishermen'}
                </p>

                {/* Business Stats */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg px-3 sm:px-4 py-2"
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green dark:text-green-400">
                      {businessData.stats.totalProducts}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Products</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg px-3 sm:px-4 py-2"
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {businessData.stats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Avg Rating</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg px-3 sm:px-4 py-2"
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {businessData.stats.totalReviews}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Reviews</div>
                  </motion.div>
                </div>

                {/* Business Details - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {businessData.user.sellerApplication?.businessType && (
                    <div>
                      <strong className="text-gray-900 dark:text-white">Type:</strong> {businessData.user.sellerApplication.businessType}
                    </div>
                  )}
                  {businessData.user.sellerApplication?.yearsOfExperience && (
                    <div>
                      <strong className="text-gray-900 dark:text-white">Experience:</strong> {businessData.user.sellerApplication.yearsOfExperience} years
                    </div>
                  )}
                  {businessData.user.sellerApplication?.address && (
                    <div className="truncate">
                      <strong className="text-gray-900 dark:text-white">Location:</strong> {businessData.user.sellerApplication.address}
                    </div>
                  )}
                  {businessData.user.sellerApplication?.contactNumber && (
                    <div>
                      <strong className="text-gray-900 dark:text-white">Contact:</strong> {businessData.user.sellerApplication.contactNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContactSeller}
                className="w-full md:w-auto btn-hover bg-primary-green dark:bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-leaf-green transition-colors duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Seller
              </motion.button>
            </div>
          </motion.div>

          {/* Products Section - Shopee Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Our Products ({filteredProducts.length})
              </h2>

              {/* Category Filter - Mobile Optimized */}
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-primary-green dark:bg-green-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid - Shopee Style (matching products page) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square image-overlay group overflow-hidden">
                      <img
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Category Badge */}
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
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-warm-orange font-bold text-sm sm:text-lg lg:text-xl">
                          ₱{product.price}
                        </span>
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
                        className="w-full bg-primary-green hover:bg-leaf-green text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
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
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-12 sm:py-16"
              >
                <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No products found in this category</p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-leaf-green transition-colors text-sm sm:text-base"
                >
                  View All Products
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
