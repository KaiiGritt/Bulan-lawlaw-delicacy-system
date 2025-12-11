'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

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
  const [activeTab, setActiveTab] = useState<'favorites' | 'saved'>('favorites');
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
      const [favoritesRes, savedRes] = await Promise.all([
        fetch('/api/recipe-favorites', { credentials: 'include' }),
        fetch('/api/saved-recipes', { credentials: 'include' }),
      ]);

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

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      const res = await fetch(`/api/recipe-favorites?recipeId=${recipeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove favorite');

      setRecipeFavorites(recipeFavorites.filter(fav => fav.recipeId !== recipeId));
      toast.success('Removed from favorites');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove favorite');
    }
  };

  const handleRemoveSaved = async (recipeId: string) => {
    try {
      const res = await fetch(`/api/saved-recipes?recipeId=${recipeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove saved recipe');

      setSavedRecipes(savedRecipes.filter(saved => saved.recipeId !== recipeId));
      toast.success('Removed from saved recipes');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove saved recipe');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-8 sm:h-12 bg-gray-200 rounded w-48 sm:w-64"></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-28 sm:w-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow h-56 sm:h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-8 lg:py-12 px-3 sm:px-6 lg:px-8">
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
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal bg-clip-text text-transparent flex items-center gap-2 sm:gap-3"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-lawlaw-ocean-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            My Collections
          </motion.h1>
          <p className="text-gray-600 mt-1.5 sm:mt-2 text-sm sm:text-base">Manage your favorite recipes and saved items</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 sm:p-6 border-2 border-rose-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-rose-700">Favorites</p>
                <p className="text-2xl sm:text-3xl font-bold text-rose-900 mt-0.5 sm:mt-1">{recipeFavorites.length}</p>
              </div>
              <div className="bg-rose-200 p-2 sm:p-3 rounded-full">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-rose-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border-2 border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-700">Saved</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-0.5 sm:mt-1">{savedRecipes.length}</p>
              </div>
              <div className="bg-purple-200 p-2 sm:p-3 rounded-full">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { key: 'favorites', label: 'Favorites', mobileLabel: 'Favorites', count: recipeFavorites.length, icon: '⭐' },
            { key: 'saved', label: 'Saved Recipes', mobileLabel: 'Saved', count: savedRecipes.length, icon: '📖' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1.5 sm:mr-2">{tab.icon}</span>
              <span className="sm:hidden">{tab.mobileLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="ml-1">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Recipe Favorites Content */}
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {recipeFavorites.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-soft-green/20 p-8 sm:p-12 text-center">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300 mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-700 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Start favoriting recipes you love</p>
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white font-medium hover:shadow-lg transition-all text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {recipeFavorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-video">
                      <Image
                        src={fav.recipe.image || '/placeholder.png'}
                        alt={fav.recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(fav.recipeId)}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors"
                        title="Remove from favorites"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        fav.recipe.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        fav.recipe.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {fav.recipe.difficulty}
                      </span>
                    </div>
                    <div className="p-3 sm:p-5">
                      <Link href={`/recipes/${fav.recipe.id}`} className="font-semibold sm:font-bold text-sm sm:text-lg text-gray-900 hover:text-lawlaw-ocean-teal line-clamp-1 block">
                        {fav.recipe.title}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1 sm:mt-2 hidden sm:block">{fav.recipe.description}</p>
                      <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-sm text-gray-500">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fav.recipe.prepTime + fav.recipe.cookTime}m
                        </span>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {fav.recipe.servings}
                        </span>
                      </div>
                      <Link
                        href={`/recipes/${fav.recipe.id}`}
                        className="mt-3 sm:mt-4 w-full block text-center px-3 sm:px-4 py-2 bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white rounded-lg hover:shadow-md transition-all text-xs sm:text-sm font-medium"
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
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-soft-green/20 p-8 sm:p-12 text-center">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-700 mb-2">No saved recipes yet</h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Save recipes to try them later</p>
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white font-medium hover:shadow-lg transition-all text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {savedRecipes.map((saved) => (
                  <motion.div
                    key={saved.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-video">
                      <Image
                        src={saved.recipe.image || '/placeholder.png'}
                        alt={saved.recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => handleRemoveSaved(saved.recipeId)}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors"
                        title="Remove from saved"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        saved.recipe.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        saved.recipe.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {saved.recipe.difficulty}
                      </span>
                    </div>
                    <div className="p-3 sm:p-5">
                      <Link href={`/recipes/${saved.recipe.id}`} className="font-semibold sm:font-bold text-sm sm:text-lg text-gray-900 hover:text-lawlaw-ocean-teal line-clamp-1 block">
                        {saved.recipe.title}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1 sm:mt-2 hidden sm:block">{saved.recipe.description}</p>
                      {saved.notes && (
                        <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-[10px] sm:text-xs text-purple-700 font-medium">Notes:</p>
                          <p className="text-[10px] sm:text-xs text-purple-600 mt-0.5 line-clamp-2">{saved.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-sm text-gray-500">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {saved.recipe.prepTime + saved.recipe.cookTime}m
                        </span>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {saved.recipe.servings}
                        </span>
                      </div>
                      <Link
                        href={`/recipes/${saved.recipe.id}`}
                        className="mt-3 sm:mt-4 w-full block text-center px-3 sm:px-4 py-2 bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white rounded-lg hover:shadow-md transition-all text-xs sm:text-sm font-medium"
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
