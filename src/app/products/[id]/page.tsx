'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddToCartModal from '../../components/AddToCartModal';
import ReviewsSection from '../../components/ReviewsSection';
import toast, { Toaster } from 'react-hot-toast';

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
      businessLogo: string | null;
      businessDescription: string | null;
      address: string;
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

interface SuggestedProduct {
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
      businessDescription: string | null;
      address: string;
    } | null;
  };
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          // Fetch suggested products from the same seller
          fetchSuggestedProducts(data.user.id, id);
        } else {
          router.push('/products');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params, router]);

  const fetchSuggestedProducts = async (sellerId: string, currentProductId: string) => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const allProducts = await response.json();
        const suggestions = allProducts
          .filter((p: SuggestedProduct) => p.user.id === sellerId && p.id !== currentProductId)
          .slice(0, 4); // Limit to 4 suggestions
        setSuggestedProducts(suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggested products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please login to add items to cart', {
        duration: 3000,
        position: 'top-center',
      });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    if (!product) {
      toast.error('Product not found');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity
        }),
      });

      if (response.ok) {
        toast.success('Product added to cart!', {
          duration: 2000,
          position: 'top-center',
        });
        setShowCartModal(true);
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
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!session) {
      toast.error('Please login to make a purchase');
      router.push('/login');
      return;
    }

    if (!product) return;

    try {
      // Add to cart first
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error: any) {
      toast.error(error.message || 'Failed to proceed to checkout');
    }
  };

  const handleContactSeller = () => {
    if (!product || !session) {
      alert('Please login to contact the seller');
      return;
    }
    // Start a conversation with the seller
    router.push(`/chat?productId=${product.id}&sellerId=${product.user.id}`);
  };

  const handleFollowToggle = () => {
    if (!session) {
      alert('Please login to follow this seller');
      return;
    }
    // Toggle follow state (you can implement actual API call here)
    setIsFollowing(!isFollowing);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button Skeleton */}
            <div className="mb-6 animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>

                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>

                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="flex gap-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-gray-600">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  const shopSlug = product.user.sellerApplication?.businessName?.toLowerCase().replace(/\s+/g, '-') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 lg:py-12">
      <Toaster position="top-center" />
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="relative h-64 sm:h-80 lg:h-96">
              <img
                src={product.image || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="mb-3 sm:mb-6">
              <span className="bg-primary-green/90 backdrop-blur-sm text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 inline-block">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{product.name}</h1>

            {/* Rating Display - Shopee Style */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
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
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 underline decoration-dotted">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {product.comments?.length || 0} Reviews
              </span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {product.stock > 0 ? `${product.stock} Sold` : 'Out of Stock'}
              </span>
            </div>

            {/* Price Section - Shopee Style */}
            <div className="bg-soft-green/10 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                  ₱{(product.price * 1.2).toFixed(2)}
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-warm-orange">
                  ₱{product.price}
                </span>
                <span className="px-2 py-1 bg-warm-orange text-white text-xs sm:text-sm font-bold rounded">
                  -20%
                </span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 btn-hover bg-primary-green text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-leaf-green transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 btn-hover bg-banana-leaf text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-leaf-green transition-colors duration-300"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Product Specifications - Shopee Style */}
            <div className="mt-6 sm:mt-8">
              <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-white">Product Details</h2>
              <div className="bg-soft-green/5 dark:bg-gray-700/30 rounded-lg border border-soft-green/20 dark:border-gray-600 overflow-hidden">
                <div className="divide-y divide-soft-green/20 dark:divide-gray-600">
                  <div className="flex py-2.5 sm:py-3 px-3 sm:px-4">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-24 sm:w-32 flex-shrink-0">Category</span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </span>
                  </div>
                  <div className="flex py-2.5 sm:py-3 px-3 sm:px-4">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-24 sm:w-32 flex-shrink-0">Stock</span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                      {product.stock} pieces available
                    </span>
                  </div>
                  <div className="flex py-2.5 sm:py-3 px-3 sm:px-4">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-24 sm:w-32 flex-shrink-0">Origin</span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                      Bulan, Sorsogon, Philippines
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description - Shopee Style */}
            <div className="mt-4 sm:mt-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-white">Description</h2>
              <div className="bg-white dark:bg-gray-700/30 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business/Seller Section - Shopee Style - Mobile Optimized */}
        {product.user.sellerApplication && (
          <Link
            href={`/seller-shop/${shopSlug}`}
            className="block mt-4 sm:mt-6 lg:mt-8 bg-gradient-to-r from-white to-soft-green/5 dark:from-gray-800 dark:to-gray-700 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-soft-green/30 dark:border-gray-600 overflow-hidden"
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Left Side: Logo + Business Info */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Business Logo */}
                  {product.user.sellerApplication.businessLogo ? (
                    <img
                      src={product.user.sellerApplication.businessLogo}
                      alt={product.user.sellerApplication.businessName}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-primary-green/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-primary-green to-leaf-green flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                      {product.user.sellerApplication.businessName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Business Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                        {product.user.sellerApplication.businessName}
                      </h3>
                      <span className="hidden sm:inline-flex px-2 py-0.5 bg-primary-green/10 text-primary-green dark:bg-green-900/30 dark:text-green-400 rounded text-[10px] font-medium flex-shrink-0">
                        Official
                      </span>
                    </div>

                    {/* Business Address */}
                    <div className="flex items-start gap-1.5 mb-1.5 sm:mb-2">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {product.user.sellerApplication.address}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{suggestedProducts.length + 1} Products</span>
                      </div>
                      <div className="h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{product.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Arrow Button */}
                <div className="flex-shrink-0 bg-soft-green/10 dark:bg-gray-700 rounded-lg p-2 sm:p-2.5 hover:bg-primary-green/20 dark:hover:bg-green-900/30 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-green dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Bottom Action Buttons - Mobile Optimized */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-soft-green/20 dark:border-gray-600">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleContactSeller();
                  }}
                  className="flex-1 bg-white dark:bg-gray-700 text-primary-green dark:text-green-400 border border-primary-green/30 dark:border-green-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-green/5 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden sm:inline">Chat Now</span>
                  <span className="sm:hidden">Chat</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollowToggle();
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                      : 'bg-primary-green/10 dark:bg-green-900/30 text-primary-green dark:text-green-400 border border-primary-green/30 dark:border-green-600 hover:bg-primary-green/20 dark:hover:bg-green-900/40'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Link>
        )}

        {/* Reviews Section - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 lg:mt-12">
          <ReviewsSection
            itemId={product.id}
            itemType="product"
            itemName={product.name}
            productOwnerId={product.user.id}
          />
        </div>

        {/* Suggested Products - Mobile Optimized */}
        {suggestedProducts.length > 0 && (
          <div className="mt-6 sm:mt-8 lg:mt-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-green dark:text-green-400 mb-4 sm:mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {suggestedProducts.map((suggestedProduct) => (
                <Link
                  key={suggestedProduct.id}
                  href={`/products/${suggestedProduct.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={suggestedProduct.image || '/placeholder.png'}
                      alt={suggestedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary-green mb-2">{suggestedProduct.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{suggestedProduct.description}</p>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.floor(suggestedProduct.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        ({suggestedProduct.rating?.toFixed(1) || '0.0'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-green">₱{suggestedProduct.price}</span>
                      <span className="text-sm text-gray-500">Stock: {suggestedProduct.stock}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add to Cart Success Modal */}
      {product && (
        <AddToCartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          productName={product.name}
          productImage={product.image}
          quantity={quantity}
        />
      )}
    </div>
  );
}
