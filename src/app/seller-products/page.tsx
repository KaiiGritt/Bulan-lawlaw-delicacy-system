'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export default function SellerProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    // Check if user is a seller
    if (session.user?.role !== 'seller') {
      toast.error('Access denied. Sellers only.');
      router.push('/profile');
      return;
    }
    fetchProducts();
  }, [session, status, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products', { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        if (data.error) {
          toast.error(`Error loading products: ${data.error}`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      // First, upload the image
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Image upload failed');
      }

      const { imageUrl } = await uploadRes.json();

      // Then create the product with the image URL
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: imageUrl,
          stock: parseInt(newProduct.stock) || 0,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
      setImageFile(null);
      setImagePreview('');
      setShowAddProductForm(false);
      fetchProducts();
      toast.success('Product added successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to add product');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error' };
        }
        throw new Error(errorData.error || `Delete failed with status ${res.status}`);
      }

      fetchProducts();
      toast.success('Product deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Delete product error:', err);
      toast.error(err.message || 'Failed to delete product');
    }
  };


  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-3">
                <svg className="w-10 h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your product inventory</p>
            </div>
            <button
              onClick={() => {
                setShowAddProductForm(!showAddProductForm);
                if (showAddProductForm) {
                  setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
                  setImageFile(null);
                  setImagePreview('');
                }
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-green to-leaf-green text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              {showAddProductForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Product
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddProductForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleAddProduct}
            className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-green focus:border-transparent"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-green focus:border-transparent"
                required
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-green focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="fresh">Fresh</option>
                <option value="dried">Dried</option>
                <option value="processed">Processed</option>
              </select>
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Product Image (Max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-green file:text-white
                    hover:file:bg-leaf-green
                    file:cursor-pointer cursor-pointer"
                  required
                />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>
              <textarea
                placeholder="Product Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="p-3 rounded-lg border border-gray-300 bg-white md:col-span-2 focus:ring-2 focus:ring-primary-green focus:border-transparent"
                rows={3}
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-green to-leaf-green text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all col-span-full font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Product
              </button>
            </div>
          </motion.form>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative">
                <img
                  src={p.image || '/placeholder.png'}
                  alt={p.name}
                  className="w-full h-56 object-cover"
                />
              </div>
              <div className="p-5">
                <h4 className="font-bold text-xl text-primary-green mb-2 line-clamp-1">{p.name}</h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{p.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">${p.price}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Stock: {p.stock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-700 capitalize">{p.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(p.id)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(p.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm === p.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-800 border border-red-200"
                  >
                    <p className="font-medium mb-2">Delete this product?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 font-medium"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">You haven&apos;t added any products yet</p>
            {!showAddProductForm && (
              <button
                onClick={() => setShowAddProductForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
