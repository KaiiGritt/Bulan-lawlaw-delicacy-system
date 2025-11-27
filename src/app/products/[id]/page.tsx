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

  const businessSlug = product.user.sellerApplication?.businessName?.toLowerCase().replace(/\s+/g, '-') || '';

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

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-green dark:text-green-400 mb-3 sm:mb-4">{product.name}</h1>

            {/* Rating Display */}
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
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
              <span className="ml-2 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                ({product.comments?.length || 0} reviews)
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-primary-green dark:text-green-400 mb-2 sm:mb-4">₱{product.price}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
              Stock: <span className="font-semibold">{product.stock}</span> available
            </p>

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
                  onClick={handleContactSeller}
                  className="flex-1 btn-hover bg-banana-leaf text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-leaf-green transition-colors duration-300"
                >
                  Contact Seller
                </button>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Product Information</h2>
              <div className="bg-cream-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-cream-100 dark:border-gray-600 space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">Description</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300">
                    {product.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">About This Product</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300">
                    This {product.category} Lawlaw product is sourced directly from local fishermen in Bulan, Philippines.
                    We ensure the highest quality and freshness for all our products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business/Seller Section - Shopee Style - Mobile Optimized */}
        {product.user.sellerApplication && (
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
              {/* Business Logo */}
              <div className="flex-shrink-0">
                <img
                  src={product.user.sellerApplication.businessLogo || '/placeholder-business.png'}
                  alt={product.user.sellerApplication.businessName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary-green dark:border-green-400"
                />
              </div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/business/${businessSlug}`}
                  className="text-base sm:text-lg lg:text-xl font-bold text-primary-green dark:text-green-400 hover:text-leaf-green dark:hover:text-green-300 transition-colors duration-300 inline-flex items-center gap-2"
                >
                  <span className="truncate">{product.user.sellerApplication.businessName}</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {product.user.sellerApplication.businessDescription && (
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1.5 sm:mt-2 line-clamp-2">
                    {product.user.sellerApplication.businessDescription}
                  </p>
                )}
                <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="truncate">Products: {suggestedProducts.length + 1}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {product.rating?.toFixed(1) || '0.0'} Rating
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                <button
                  onClick={handleContactSeller}
                  className="btn-hover bg-primary-green dark:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-leaf-green transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Contact</span>
                </button>
                <button
                  onClick={handleFollowToggle}
                  className={`btn-hover px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-white dark:bg-gray-800 text-primary-green dark:text-green-400 border-2 border-primary-green dark:border-green-400 hover:bg-primary-green hover:text-white dark:hover:bg-green-600'
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
          </div>
        )}

        {/* Reviews Section - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 lg:mt-12">
          <ReviewsSection
            itemId={product.id}
            itemType="product"
            itemName={product.name}
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
