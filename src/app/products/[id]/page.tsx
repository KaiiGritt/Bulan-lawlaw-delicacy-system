import { notFound } from 'next/navigation';
import { mockProducts } from '../../data/mockData';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="relative h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg">Product Image</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-6">
              <span className="bg-primary-green/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>
            <p className="text-3xl font-bold text-primary-green mb-4">₱{product.price}</p>
            <p className="text-sm text-gray-500 mb-6">
              Stock: {product.stock} available
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  defaultValue="1"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 btn-hover bg-primary-green text-white px-6 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300">
                  Add to Cart
                </button>
                <button className="flex-1 btn-hover bg-banana-leaf text-white px-6 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300">
                  Buy Now
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Product Information</h2>
              <div className="bg-cream-50 p-6 rounded-xl border border-cream-100">
                <p className="text-gray-700">
                  This {product.category} Lawlaw product is sourced directly from local fishermen in Bulan, Philippines.
                  We ensure the highest quality and freshness for all our products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
