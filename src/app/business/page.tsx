'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Business {
  userId: string;
  userName: string;
  businessName: string;
  businessLogo: string | null;
  description: string;
  businessType: string;
  productCount: number;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const products = await response.json();

          // Group products by seller
          const businessMap = new Map<string, Business>();

          products.forEach((product: any) => {
            if (product.user.sellerApplication) {
              const userId = product.user.id;
              if (!businessMap.has(userId)) {
                businessMap.set(userId, {
                  userId,
                  userName: product.user.name,
                  businessName: product.user.sellerApplication.businessName,
                  businessLogo: product.user.sellerApplication.businessLogo,
                  description: product.user.sellerApplication.description,
                  businessType: product.user.sellerApplication.businessType,
                  productCount: 1
                });
              } else {
                const business = businessMap.get(userId)!;
                business.productCount++;
              }
            }
          });

          setBusinesses(Array.from(businessMap.values()));
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

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
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green dark:text-green-400 mb-4">
              Our Businesses
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Discover local sellers and their products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {businesses.map((business, index) => {
              const slug = business.businessName.toLowerCase().replace(/\s+/g, '-');

              return (
                <motion.div
                  key={business.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/business/${slug}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        {business.businessLogo ? (
                          <img
                            src={business.businessLogo}
                            alt={business.businessName}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-primary-green"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary-green to-leaf-green flex items-center justify-center text-white text-2xl font-bold">
                            {business.businessName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                            {business.businessName}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-primary-green/10 text-primary-green dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                            {business.businessType}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {business.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {business.productCount} {business.productCount === 1 ? 'Product' : 'Products'}
                        </span>
                        <span className="text-primary-green dark:text-green-400 font-medium flex items-center gap-1">
                          View Shop
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {businesses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No businesses found
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
