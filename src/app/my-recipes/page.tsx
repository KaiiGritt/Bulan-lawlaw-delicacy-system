'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface Recipe {
  id: string;
  userId: number | null;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  createdAt: string;
}

export default function MyRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchMyRecipes();
  }, [session, status, router]);

  const fetchMyRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      if (res.ok) {
        const data = await res.json();
        // Filter recipes that belong to the current user
        const userRecipes = data.filter((recipe: Recipe) =>
          recipe.userId === parseInt(session?.user?.id || '0')
        );
        setRecipes(userRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load your recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId: string) => {
    setDeletingId(recipeId);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete recipe');
      }

      toast.success('Recipe deleted successfully!');
      setRecipes(recipes.filter(r => r.id !== recipeId));
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast.error(error.message || 'Failed to delete recipe');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Skeleton Header */}
          <div className="mb-6 sm:mb-12">
            <div className="h-8 sm:h-12 bg-gray-200 rounded animate-pulse w-48 sm:w-64 mb-3 sm:mb-4"></div>
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-72 sm:w-96 max-w-full"></div>
          </div>

          {/* Skeleton Stats */}
          <div className="bg-white rounded-xl p-4 mb-6 animate-pulse">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                <div className="relative aspect-[4/3] sm:aspect-video bg-gray-200"></div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-9 sm:h-10 bg-gray-200 rounded-lg flex-1"></div>
                    <div className="h-9 sm:h-10 bg-gray-200 rounded-lg flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-8 lg:py-12 relative">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Delete Recipe?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={deletingId === showDeleteModal}
                  className="flex-1 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {deletingId === showDeleteModal ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="hidden sm:inline">Deleting...</span>
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/profile" className="text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-sm sm:text-base font-medium">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-lawlaw-ocean-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                My Recipes
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
                Manage your culinary creations
              </p>
            </div>
            <Link
              href="/add-recipe"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-deep-blue text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add New Recipe</span>
              <span className="sm:hidden">Add Recipe</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-6 mb-5 sm:mb-8 border border-lawlaw-steel-blue/20"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-lawlaw-ocean-teal">{recipes.length}</div>
              <div className="text-[10px] sm:text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-xl sm:text-3xl font-bold text-green-600">
                {recipes.filter(r => r.difficulty === 'Beginner').length}
              </div>
              <div className="text-[10px] sm:text-sm text-gray-600">Beginner</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-yellow-600">
                {recipes.filter(r => r.difficulty === 'Intermediate').length + recipes.filter(r => r.difficulty === 'Advanced').length}
              </div>
              <div className="text-[10px] sm:text-sm text-gray-600">Advanced</div>
            </div>
          </div>
        </motion.div>

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 group"
              >
                {/* Recipe Image */}
                <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
                  <Image
                    src={recipe.image || "/api/placeholder/400/250"}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Difficulty Badge */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${
                      recipe.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
                      recipe.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  {/* View Button Overlay */}
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <span className="bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      View Recipe
                    </span>
                  </Link>
                </div>

                {/* Recipe Info */}
                <div className="p-3 sm:p-4 lg:p-5">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
                    {recipe.description}
                  </p>

                  {/* Time & Servings */}
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs lg:text-sm text-gray-500 mb-2 sm:mb-3">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{recipe.prepTime + recipe.cookTime}m</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{recipe.servings}</span>
                    </div>
                  </div>

                  {/* Created Date - Hidden on small mobile */}
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-3 hidden sm:block">
                    {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 sm:gap-2">
                    <Link
                      href={`/edit-recipe/${recipe.id}`}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-lawlaw-steel-blue to-lawlaw-ocean-teal text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm hover:shadow-md transition-all"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(recipe.id)}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-red-100 text-red-600 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm hover:bg-red-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-24"
          >
            <div className="mx-auto w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-lawlaw-silver to-lawlaw-steel-blue/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-lawlaw-ocean-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
              No recipes yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Start sharing your culinary creations with the community!
            </p>
            <Link
              href="/add-recipe"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lawlaw-ocean-teal to-lawlaw-deep-blue text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Recipe
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
