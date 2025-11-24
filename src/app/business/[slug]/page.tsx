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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading business...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Business Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary-green mb-2">
                {businessData.user.sellerApplication?.businessName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {businessData.user.sellerApplication?.description || 'Fresh seafood products from local fishermen'}
              </p>

              {/* Business Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-green">{businessData.stats.totalProducts}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-green">
                    {businessData.stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-green">{businessData.stats.totalReviews}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Business Type:</strong> {businessData.user.sellerApplication?.businessType}
                </div>
                <div>
                  <strong>Experience:</strong> {businessData.user.sellerApplication?.yearsOfExperience} years
                </div>
                <div>
                  <strong>Location:</strong> {businessData.user.sellerApplication?.address}
                </div>
                <div>
                  <strong>Contact:</strong> {businessData.user.sellerApplication?.contactNumber}
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 md:ml-8">
              <button
                onClick={handleContactSeller}
                className="btn-hover bg-primary-green text-white px-8 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-green">Our Products</h2>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary-green text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Product Image</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-primary-green mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${
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
                    <span className="ml-1 text-sm text-gray-600">
                      ({product.rating?.toFixed(1) || '0.0'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-green">₱{product.price}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No products found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
