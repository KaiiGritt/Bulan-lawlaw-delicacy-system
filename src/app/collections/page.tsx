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
  status: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

interface RecipeFavorite {
  id: string;
  recipeId: string;
  createdAt: string;
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
  };
}

interface SavedRecipe {
  id: string;
  recipeId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
  };
}

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'wishlist' | 'favorites' | 'saved'>('wishlist');
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [recipeFavorites, setRecipeFavorites] = useState<RecipeFavorite[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchCollections();
  }, [session, status, router]);

  const fetchCollections = async () => {
    try {
      const [wishlistRes, favoritesRes, savedRes] = await Promise.all([
        fetch('/api/wishlist', { credentials: 'include' }),
        fetch('/api/recipe-favorites', { credentials: 'include' }),
        fetch('/api/saved-recipes', { credentials: 'include' }),
      ]);

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlistItems(wishlistData);
      }

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setRecipeFavorites(favoritesData);
      }

      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedRecipes(savedData);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove from wishlist');

      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item');
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const res = await fetch(`/api/recipe-favorites/${favoriteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove favorite');

      setRecipeFavorites(recipeFavorites.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove favorite');
    }
  };

  const handleRemoveSaved = async (savedId: string) => {
    try {
      const res = await fetch(`/api/saved-recipes/${savedId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove saved recipe');

      setSavedRecipes(savedRecipes.filter(saved => saved.id !== savedId));
      toast.success('Removed from saved recipes');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove saved recipe');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-3"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            My Collections
          </motion.h1>
          <p className="text-gray-600 mt-2">Manage your wishlist, favorite recipes, and saved items</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Wishlist Items</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{wishlistItems.length}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border-2 border-rose-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-700">Recipe Favorites</p>
                <p className="text-3xl font-bold text-rose-900 mt-1">{recipeFavorites.length}</p>
              </div>
              <div className="bg-rose-200 p-3 rounded-full">
                <svg className="w-8 h-8 text-rose-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Saved Recipes</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{savedRecipes.length}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'wishlist', label: 'Wishlist', count: wishlistItems.length, icon: '💛' },
            { key: 'favorites', label: 'Recipe Favorites', count: recipeFavorites.length, icon: '⭐' },
            { key: 'saved', label: 'Saved Recipes', count: savedRecipes.length, icon: '📖' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-primary-green to-banana-leaf text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Wishlist Content */}
        {activeTab === 'wishlist' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-12 text-center">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">Start adding products to your wishlist</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="relative">
                      <img
                        src={item.product.image || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                        title="Remove from wishlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-5">
                      <Link href={`/products/${item.product.id}`} className="font-bold text-lg text-gray-900 hover:text-primary-green line-clamp-1 block">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{item.product.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-2xl font-bold text-primary-green">${item.product.price}</p>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-primary-green to-leaf-green text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Recipe Favorites Content */}
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {recipeFavorites.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-12 text-center">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No favorite recipes yet</h3>
                <p className="text-gray-500 mb-6">Start favoriting recipes you love</p>
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipeFavorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="relative">
                      <img
                        src={fav.recipe.image || '/placeholder.png'}
                        alt={fav.recipe.title}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                        title="Remove from favorites"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        fav.recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        fav.recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {fav.recipe.difficulty}
                      </span>
                    </div>
                    <div className="p-5">
                      <Link href={`/recipes/${fav.recipe.id}`} className="font-bold text-lg text-gray-900 hover:text-primary-green line-clamp-1 block">
                        {fav.recipe.title}
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{fav.recipe.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fav.recipe.prepTime + fav.recipe.cookTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {fav.recipe.servings} servings
                        </span>
                      </div>
                      <Link
                        href={`/recipes/${fav.recipe.id}`}
                        className="mt-4 w-full block text-center px-4 py-2 bg-gradient-to-r from-primary-green to-leaf-green text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                      >
                        View Recipe
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Saved Recipes Content */}
        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {savedRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-12 text-center">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No saved recipes yet</h3>
                <p className="text-gray-500 mb-6">Save recipes to try them later</p>
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf text-white font-medium hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((saved) => (
                  <motion.div
                    key={saved.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="relative">
                      <img
                        src={saved.recipe.image || '/placeholder.png'}
                        alt={saved.recipe.title}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveSaved(saved.id)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                        title="Remove from saved"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        saved.recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        saved.recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {saved.recipe.difficulty}
                      </span>
                    </div>
                    <div className="p-5">
                      <Link href={`/recipes/${saved.recipe.id}`} className="font-bold text-lg text-gray-900 hover:text-primary-green line-clamp-1 block">
                        {saved.recipe.title}
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{saved.recipe.description}</p>
                      {saved.notes && (
                        <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs text-purple-700 font-medium">Your Notes:</p>
                          <p className="text-xs text-purple-600 mt-1 line-clamp-2">{saved.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {saved.recipe.prepTime + saved.recipe.cookTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {saved.recipe.servings} servings
                        </span>
                      </div>
                      <Link
                        href={`/recipes/${saved.recipe.id}`}
                        className="mt-4 w-full block text-center px-4 py-2 bg-gradient-to-r from-primary-green to-leaf-green text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                      >
                        View Recipe
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
