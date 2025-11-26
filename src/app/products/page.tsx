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
    : products.filter(product => product.category === selectedCategory);

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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:bg-gray-950 py-12 relative">
      {/* Animated background for dark mode */}
      <div className="absolute inset-0 hidden dark:block overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="pulsing-orb absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
        <div className="floating-orb absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '6s' }}></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-16 fade-in-up">
          <div>
            <h1 className="text-5xl font-bold text-primary-green dark:text-green-400 mb-4">Our Lawlaw Delicacies</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the finest selection of fresh and processed Lawlaw products from trusted fishermen in Bulan
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="relative h-64 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="card-hover bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-64 image-overlay group">
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-green/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-warm-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                    ₱{product.price}
                  </span>
                </div>
                {product.stock < 10 && (
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Low Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary-green dark:text-green-400 mb-2">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{product.description}</p>

                {/* Business Name */}
                {product.user.sellerApplication?.businessName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    By {product.user.sellerApplication.businessName}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
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
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    ({product.rating?.toFixed(1) || '0.0'})
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({product.comments?.length || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-green dark:text-green-400">₱{product.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 btn-hover bg-primary-green text-white px-4 py-3 rounded-xl font-medium text-center hover:bg-leaf-green transition-colors duration-300"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className="btn-hover bg-banana-leaf text-white px-4 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === product.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐟</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try selecting a different category</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-hover bg-primary-green dark:bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-leaf-green dark:hover:bg-green-500 transition-colors duration-300"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-primary-green dark:bg-green-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-lg mb-6 opacity-90">
              Contact our fishermen directly or check back later for fresh arrivals
            </p>
            <Link
              href="/contact"
              className="btn-hover inline-block bg-white text-primary-green dark:text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-cream dark:hover:bg-gray-100 transition-colors duration-300"
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
