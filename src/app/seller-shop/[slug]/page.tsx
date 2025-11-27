'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface ShopPageProps {
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
}

interface ShopData {
  seller: {
    id: string;
    name: string;
    email: string;
  };
  shopInfo: {
    businessName: string;
    businessLogo: string | null;
    description: string;
    businessType: string;
    contactNumber: string;
    address: string;
  };
  products: Product[];
  stats: {
    totalProducts: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    joinedDate: string;
  };
}

export default function ShopPage({ params }: ShopPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [isFollowing, setIsFollowing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const { slug } = await params;
        const shopName = slug.replace(/-/g, ' ');

        const response = await fetch('/api/products');
        if (response.ok) {
          const allProducts = await response.json();

          const shopProducts = allProducts.filter((product: any) =>
            product.user.sellerApplication?.businessName?.toLowerCase() === shopName.toLowerCase()
          );

          if (shopProducts.length > 0) {
            const sellerApp = shopProducts[0].user.sellerApplication;
            const stats = {
              totalProducts: shopProducts.length,
              averageRating: shopProducts.reduce((acc: number, product: any) => acc + (product.rating || 0), 0) / shopProducts.length,
              totalReviews: shopProducts.reduce((acc: number, product: any) => acc + (product.comments?.length || 0), 0),
              responseRate: 95,
              joinedDate: '2024'
            };

            setShopData({
              seller: shopProducts[0].user,
              shopInfo: sellerApp,
              products: shopProducts,
              stats
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [params]);

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      toast.error('Please login to add items to cart', {
        duration: 3000,
        position: 'top-center',
      });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    setAddingToCart(productId);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        toast.success('Product added to cart!', {
          duration: 2000,
          position: 'top-center',
        });
      } else if (response.status === 401) {
        toast.error('Please login to add items to cart');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleContactSeller = () => {
    if (!shopData || !session) {
      toast.error('Please login to contact the seller');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    window.location.href = `/chat?sellerId=${shopData.seller.id}`;
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed shop' : 'Following shop!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12">
        <Toaster position="top-center" />
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <Toaster position="top-center" />
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">Shop not found</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = selectedCategory === 'All'
    ? shopData.products
    : shopData.products.filter(product => product.category === selectedCategory.toLowerCase());

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // latest
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-center" />

      {/* Shop Header Banner - Shopee Style */}
      <div className="bg-gradient-to-r from-primary-green via-leaf-green to-banana-leaf">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="py-8 sm:py-12 lg:py-16">
            {/* Shop Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Shop Logo */}
                <div className="flex-shrink-0">
                  {shopData.shopInfo.businessLogo ? (
                    <img
                      src={shopData.shopInfo.businessLogo}
                      alt={shopData.shopInfo.businessName}
                      className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-2xl object-cover border-4 border-primary-green shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-primary-green to-leaf-green flex items-center justify-center text-white text-3xl sm:text-4xl lg:text-5xl font-bold shadow-lg">
                      {shopData.shopInfo.businessName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Shop Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                        {shopData.shopInfo.businessName}
                      </h1>
                      <span className="px-2 sm:px-3 py-1 bg-primary-green text-white rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0">
                        Official Store
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleContactSeller}
                        className="flex-1 sm:flex-initial bg-white dark:bg-gray-700 text-primary-green dark:text-green-400 border-2 border-primary-green dark:border-green-600 px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-green/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="hidden sm:inline">Chat</span>
                      </button>
                      <button
                        onClick={handleFollowToggle}
                        className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          isFollowing
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            : 'bg-primary-green text-white hover:bg-leaf-green'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Shop Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green dark:text-green-400">
                        {shopData.stats.totalProducts}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Products</div>
                    </div>
                    <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-500">
                        {shopData.stats.averageRating.toFixed(1)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Rating</div>
                    </div>
                    <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green dark:text-green-400">
                        {shopData.stats.responseRate}%
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Response</div>
                    </div>
                    <div className="bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green dark:text-green-400">
                        {shopData.stats.joinedDate}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Joined</div>
                    </div>
                  </div>

                  {/* Shop Description */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {shopData.shopInfo.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Shop Products Section */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Filters and Sort */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['All', 'Fresh', 'Dried', 'Processed'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-green text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs sm:text-sm border-none focus:ring-2 focus:ring-primary-green"
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/products/${product.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[32px] sm:min-h-[40px] mb-1 sm:mb-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-1 sm:mb-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      {product.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-warm-orange font-bold text-sm sm:text-base lg:text-lg">
                      ₱{product.price}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product.id);
                    }}
                    disabled={product.stock === 0 || addingToCart === product.id}
                    className="w-full mt-2 bg-primary-green hover:bg-leaf-green text-white py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === product.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    ) : product.stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No Products */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
