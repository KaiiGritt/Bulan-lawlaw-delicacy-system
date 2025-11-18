'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'fresh' | 'dried' | 'processed';
  image: string;
  stock: number;
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  const categories = ['All', 'Fresh', 'Dried', 'Processed'];
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16 fade-in-up">
            <div>
              <h1 className="text-5xl font-bold text-primary-green mb-4">Our Lawlaw Delicacies</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the finest selection of fresh and processed Lawlaw products from trusted fishermen in Bulan
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary-green text-gray-400 shadow-md'
                      : 'text-gray-700 hover:bg-white/60 hover:text-primary-green'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-64 image-overlay group">
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-green/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
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
                <h3 className="text-xl font-semibold text-primary-green mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-green">₱{product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 btn-hover bg-primary-green text-white px-4 py-3 rounded-xl font-medium text-center hover:bg-leaf-green transition-colors duration-300"
                  >
                    View Details
                  </Link>
                  <button className="btn-hover bg-banana-leaf text-white px-4 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8" />
                    </svg>
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
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try selecting a different category</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-primary-green rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-lg mb-6 opacity-90">
              Contact our fishermen directly or check back later for fresh arrivals
            </p>
            <Link
              href="/contact"
              className="btn-hover inline-block bg-white text-primary-green px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-cream transition-colors duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
  );
}
