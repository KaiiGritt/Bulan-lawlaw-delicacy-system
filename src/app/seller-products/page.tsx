'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  // When editing product changes, update the edit form
  useEffect(() => {
    if (editingProduct) {
      setEditForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: String(editingProduct.price),
        category: editingProduct.category,
        stock: String(editingProduct.stock),
      });
      setEditImagePreview(editingProduct.image);
      setEditImageFile(null);
    }
  }, [editingProduct]);

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

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setEditImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsUpdating(true);

    try {
      let imageUrl = editingProduct.image;

      // If new image selected, upload it first
      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);

        const uploadRes = await fetch('/api/upload/product', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      // Update the product
      const res = await fetch(`/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: editForm.price,
          category: editForm.category,
          stock: editForm.stock,
          image: imageUrl,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      setEditingProduct(null);
      setEditImageFile(null);
      setEditImagePreview('');
      fetchProducts();
      toast.success('Product updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update product');
    } finally {
      setIsUpdating(false);
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
      <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-8 sm:h-12 bg-gray-200 rounded w-48 sm:w-64"></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-8 sm:h-10 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 sm:h-10 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-lawlaw-ocean-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="hidden sm:inline">Product Management</span>
                <span className="sm:hidden">Products</span>
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your product inventory</p>
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
              className="w-full sm:w-auto bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
            >
              {showAddProductForm ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add New Product</span>
                  <span className="sm:hidden">Add Product</span>
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
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-lawlaw-steel-blue/20 p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Add New Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent text-sm sm:text-base"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price (₱)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent text-sm sm:text-base"
                required
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent text-sm sm:text-base"
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
                className="p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent text-sm sm:text-base"
              />
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Product Image (Max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4
                    file:rounded-lg file:border-0
                    file:text-xs sm:file:text-sm file:font-semibold
                    file:bg-lawlaw-ocean-teal file:text-white
                    hover:file:bg-lawlaw-deep-blue
                    file:cursor-pointer cursor-pointer"
                  required
                />
                {imagePreview && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>
              <textarea
                placeholder="Product Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white sm:col-span-2 focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent text-sm sm:text-base"
                rows={3}
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:shadow-lg transition-all col-span-full font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Product
              </button>
            </div>
          </motion.form>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {products.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-lawlaw-steel-blue/20"
            >
              <div className="relative aspect-square">
                <img
                  src={p.image || '/placeholder.png'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 sm:p-5">
                <h4 className="font-bold text-sm sm:text-lg lg:text-xl text-lawlaw-ocean-teal mb-1 sm:mb-2 line-clamp-1">{p.name}</h4>
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4 hidden sm:block">{p.description}</p>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">₱{p.price.toFixed(2)}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Stock: {p.stock}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-700 capitalize">{p.category}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="flex-1 bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(p.id)}
                    className="flex-1 bg-red-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm === p.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 rounded-lg text-xs sm:text-sm text-red-800 border border-red-200"
                  >
                    <p className="font-medium mb-2">Delete?</p>
                    <div className="flex gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="flex-1 bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-red-700 font-medium text-xs sm:text-sm"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-gray-300 font-medium text-xs sm:text-sm"
                      >
                        No
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-lawlaw-steel-blue/20 p-8 sm:p-12 text-center">
            <svg
              className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300 mb-3 sm:mb-4"
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
            <h3 className="text-lg sm:text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">You haven&apos;t added any products yet</p>
            {!showAddProductForm && (
              <button
                onClick={() => setShowAddProductForm(true)}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white font-medium hover:shadow-lg transition-all text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Edit Product Modal */}
        <AnimatePresence>
          {editingProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="fresh">Fresh</option>
                          <option value="dried">Dried</option>
                          <option value="processed">Processed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lawlaw-ocean-teal focus:border-transparent"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                      <div className="flex items-start gap-4">
                        {editImagePreview && (
                          <img
                            src={editImagePreview}
                            alt="Current"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageChange}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-lawlaw-ocean-teal file:text-white
                              hover:file:bg-lawlaw-deep-blue
                              file:cursor-pointer cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
