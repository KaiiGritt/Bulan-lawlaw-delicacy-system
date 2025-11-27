'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Shop {
  sellerId: string;
  sellerName: string;
  shopName: string;
  shopLogo: string | null;
  description: string;
  businessType: string;
  productCount: number;
  averageRating: number;
  totalReviews: number;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const products = await response.json();

          // Group products by seller
          const shopsMap = new Map<string, Shop>();

          products.forEach((product: any) => {
            if (product.user.sellerApplication) {
              const sellerId = product.user.id;
              if (!shopsMap.has(sellerId)) {
                shopsMap.set(sellerId, {
                  sellerId,
                  sellerName: product.user.name,
                  shopName: product.user.sellerApplication.businessName,
                  shopLogo: product.user.sellerApplication.businessLogo,
                  description: product.user.sellerApplication.description,
                  businessType: product.user.sellerApplication.businessType,
                  productCount: 1,
                  averageRating: product.rating || 0,
                  totalReviews: product.comments?.length || 0
                });
              } else {
                const shop = shopsMap.get(sellerId)!;
                shop.productCount++;
                shop.averageRating = ((shop.averageRating * (shop.productCount - 1)) + (product.rating || 0)) / shop.productCount;
                shop.totalReviews += product.comments?.length || 0;
              }
            }
          });

          setShops(Array.from(shopsMap.values()));
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const filteredShops = shops.filter(shop =>
    shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green dark:text-green-400 mb-4">
              All Shops
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
              Discover local sellers and their quality Lawlaw products
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-12 sm:pl-14 bg-white dark:bg-gray-800 border-2 border-soft-green/30 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-green text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-primary-green dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Shops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredShops.map((shop, index) => {
              const slug = shop.shopName.toLowerCase().replace(/\s+/g, '-');

              return (
                <motion.div
                  key={shop.sellerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/shop/${slug}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
                  >
                    {/* Shop Header with Gradient */}
                    <div className="h-20 sm:h-24 bg-gradient-to-r from-primary-green to-leaf-green relative">
                      <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2">
                        {shop.shopLogo ? (
                          <img
                            src={shop.shopLogo}
                            alt={shop.shopName}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-banana-leaf to-soft-green flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform">
                            {shop.shopName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shop Info */}
                    <div className="pt-10 sm:pt-12 pb-4 sm:pb-6 px-4 sm:px-6">
                      <div className="text-center mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                          {shop.shopName}
                        </h3>
                        <span className="inline-flex px-2 sm:px-3 py-1 bg-primary-green/10 text-primary-green dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] sm:text-xs font-medium">
                          {shop.businessType}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mb-3 sm:mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                        {shop.description || 'Quality Lawlaw products from local sellers'}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-primary-green dark:text-green-400">
                            {shop.productCount}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Products</div>
                        </div>
                        <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-yellow-500 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {shop.averageRating.toFixed(1)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Rating</div>
                        </div>
                        <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-primary-green dark:text-green-400">
                            {shop.totalReviews}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Reviews</div>
                        </div>
                      </div>

                      {/* Visit Shop Button */}
                      <div className="bg-primary-green/5 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 flex items-center justify-between group-hover:bg-primary-green/10 transition-colors">
                        <span className="text-xs sm:text-sm font-medium text-primary-green dark:text-green-400">
                          Visit Shop
                        </span>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-primary-green dark:text-green-400 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* No Shops Found */}
          {filteredShops.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchQuery ? 'No shops found matching your search' : 'No shops available'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
