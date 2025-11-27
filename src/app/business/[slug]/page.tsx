'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
      description: string;
      businessType: string;
      yearsOfExperience: number;
      certifications: string[];
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
    // Start a conversation with the seller
    window.location.href = `/chat?sellerId=${businessData.user.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="flex gap-3 mt-4">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Skeleton */}
            <div>
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-28"></div>
                      </div>
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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-gray-600">Business not found</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = ['All', 'Fresh', 'Dried', 'Processed'];
  const filteredProducts = selectedCategory === 'All'
    ? businessData.products
    : businessData.products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 lg:py-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Business Header - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-green dark:text-green-400 mb-2">
                {businessData.user.sellerApplication?.businessName}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                {businessData.user.sellerApplication?.description || 'Fresh seafood products from local fishermen'}
              </p>

              {/* Business Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-3 sm:mb-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-green dark:text-green-400">{businessData.stats.totalProducts}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-green dark:text-green-400">
                    {businessData.stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-green dark:text-green-400">{businessData.stats.totalReviews}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reviews</div>
                </div>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <strong className="text-gray-900 dark:text-white">Business Type:</strong> {businessData.user.sellerApplication?.businessType}
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Experience:</strong> {businessData.user.sellerApplication?.yearsOfExperience} years
                </div>
                <div className="truncate">
                  <strong className="text-gray-900 dark:text-white">Location:</strong> {businessData.user.sellerApplication?.address}
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Contact:</strong> {businessData.user.sellerApplication?.contactNumber}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={handleContactSeller}
                className="w-full md:w-auto btn-hover bg-primary-green dark:bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-leaf-green transition-colors duration-300"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>

        {/* Products Section - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green dark:text-green-400">Our Products</h2>

            {/* Category Filter - Mobile Optimized */}
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-2 sm:pb-0">
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

          {/* Products Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-40 sm:h-48">
                  <img
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-primary-green dark:text-green-400 mb-1 sm:mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
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
                    <span className="ml-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      ({product.rating?.toFixed(1) || '0.0'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-primary-green dark:text-green-400">
                      ₱{product.price}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No products found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
