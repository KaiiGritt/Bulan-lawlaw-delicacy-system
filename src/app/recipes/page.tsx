'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
 user?: {
   userId: number;
   name: string | null;
   profilePicture: string | null;
 } | null;
}

export default function RecipesPage() {
 const { data: session } = useSession();
 const [selectedDifficulty, setSelectedDifficulty] = useState('All');
 const [recipes, setRecipes] = useState<Recipe[]>([]);
 const [loading, setLoading] = useState(true);
 const [favorites, setFavorites] = useState<Set<string>>(new Set());
 const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());

 const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
 const filteredRecipes = selectedDifficulty === 'All'
 ? recipes
 : recipes.filter(recipe => recipe.difficulty === selectedDifficulty);

 useEffect(() => {
 fetchRecipes();
 if (session) {
 fetchFavorites();
 fetchSaved();
 }
 }, [session]);

 const fetchRecipes = async () => {
 try {
 const res = await fetch('/api/recipes');
 if (res.ok) {
 const data = await res.json();
 setRecipes(data);
 }
 } catch (error) {
 console.error('Error fetching recipes:', error);
 } finally {
 setLoading(false);
 }
 };

 const fetchFavorites = async () => {
 try {
 const res = await fetch('/api/recipe-favorites');
 if (res.ok) {
 const data = await res.json();
 setFavorites(new Set(data.map((f: any) => f.recipeId)));
 }
 } catch (error) {
 console.error('Error fetching favorites:', error);
 }
 };

 const fetchSaved = async () => {
 try {
 const res = await fetch('/api/saved-recipes');
 if (res.ok) {
 const data = await res.json();
 setSavedRecipes(new Set(data.map((s: any) => s.recipeId)));
 }
 } catch (error) {
 console.error('Error fetching saved recipes:', error);
 }
 };

 const toggleFavorite = async (recipeId: string, e: React.MouseEvent) => {
 e.preventDefault();
 if (!session) {
 toast.error('Please login to favorite recipes');
 return;
 }

 const isFavorite = favorites.has(recipeId);

 try {
 if (isFavorite) {
 const res = await fetch(`/api/recipe-favorites?recipeId=${recipeId}`, {
 method: 'DELETE'
 });
 if (res.ok) {
 setFavorites(prev => {
 const newSet = new Set(prev);
 newSet.delete(recipeId);
 return newSet;
 });
 toast.success('Removed from favorites');
 }
 } else {
 const res = await fetch('/api/recipe-favorites', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ recipeId })
 });
 if (res.ok) {
 setFavorites(prev => new Set(prev).add(recipeId));
 toast.success('Added to favorites');
 }
 }
 } catch (error) {
 console.error('Error toggling favorite:', error);
 toast.error('Failed to update favorites');
 }
 };

 const toggleSaved = async (recipeId: string, e: React.MouseEvent) => {
 e.preventDefault();
 if (!session) {
 toast.error('Please login to save recipes');
 return;
 }

 const isSaved = savedRecipes.has(recipeId);

 try {
 if (isSaved) {
 const res = await fetch(`/api/saved-recipes?recipeId=${recipeId}`, {
 method: 'DELETE'
 });
 if (res.ok) {
 setSavedRecipes(prev => {
 const newSet = new Set(prev);
 newSet.delete(recipeId);
 return newSet;
 });
 toast.success('Removed from saved recipes');
 }
 } else {
 const res = await fetch('/api/saved-recipes', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ recipeId })
 });
 if (res.ok) {
 setSavedRecipes(prev => new Set(prev).add(recipeId));
 toast.success('Saved recipe');
 }
 }
 } catch (error) {
 console.error('Error toggling saved:', error);
 toast.error('Failed to update saved recipes');
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-8 sm:py-12">
 <div className="container mx-auto px-3 sm:px-4">
 {/* Skeleton Header */}
 <div className="text-center mb-8 sm:mb-16">
 <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse w-64 mx-auto mb-3 sm:mb-4"></div>
 <div className="h-6 bg-gray-200 rounded animate-pulse w-96 mx-auto max-w-full"></div>
 </div>

 {/* Skeleton Filter */}
 <div className="flex justify-center mb-6 sm:mb-12">
 <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg border border-white/20">
 <div className="flex gap-2">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-10 sm:h-12 w-24 sm:w-32 bg-gray-200 rounded-lg animate-pulse"></div>
 ))}
 </div>
 </div>
 </div>

 {/* Skeleton Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
 <div key={i} className="bg-white rounded-lg sm:rounded-2xl shadow-md overflow-hidden border border-gray-100">
 <div className="relative aspect-square bg-gray-200 animate-pulse"></div>
 <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
 <div className="h-4 sm:h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
 <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
 <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
 <div className="h-8 sm:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-8 sm:py-12 relative">
 <Toaster position="top-right" />

 {/* Animated background for dark mode */}
 <div className="absolute inset-0 hidden overflow-hidden pointer-events-none">
 <div className="floating-orb absolute top-20 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
 <div className="pulsing-orb absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
 </div>

 <div className="container mx-auto px-3 sm:px-4 relative z-10">
 {/* Page Header - Mobile Optimized */}
 <div className="text-center mb-8 sm:mb-16 fade-in-up">
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-green mb-3 sm:mb-4 px-2">
 Culinary Adventures
 </h1>
 <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
 Master the art of Filipino cooking with our step-by-step Lawlaw recipes
 </p>
 </div>

 {/* Difficulty Filter - Mobile Responsive */}
 <div className="flex justify-center mb-6 sm:mb-12">
 <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg border border-white/20 w-full sm:w-auto">
 <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
 {difficulties.map((difficulty) => (
 <button
 key={difficulty}
 onClick={() => setSelectedDifficulty(difficulty)}
 className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
 selectedDifficulty === difficulty
 ? 'bg-warm-orange text-white shadow-md'
 : 'text-gray-700 hover:bg-white/60 hover:text-warm-orange'
 }`}
 >
 {difficulty}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Loading State - Skeleton Cards */}
 {loading && (
 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
 <div
 key={i}
 className="bg-white rounded-lg sm:rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse"
 >
 <div className="relative aspect-square bg-gray-200"></div>
 <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
 <div className="h-4 sm:h-6 bg-gray-200 rounded w-3/4"></div>
 <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
 <div className="h-8 sm:h-10 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Recipes Grid - Shopee Style */}
 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
 {filteredRecipes.map((recipe, index) => (
 <Link
 key={recipe.id}
 href={`/recipes/${recipe.id}`}
 className="block bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] fade-in-up group"
 style={{ animationDelay: `${index * 0.05}s` }}
 >
 {/* Recipe Image */}
 <div className="relative aspect-square image-overlay group overflow-hidden">
 <Image
 src={recipe.image || "/api/placeholder/400/250"}
 alt={recipe.title}
 fill
 className="object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700 ease-out"
 />

 {/* Difficulty Badge */}
 <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
 <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${
 recipe.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
 recipe.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
 'bg-red-500 text-white'
 }`}>
 {recipe.difficulty}
 </span>
 </div>

 {/* Action Buttons - Favorite, Save, Edit */}
 {session && (
 <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 sm:gap-1.5">
 {/* Edit Button - Only for owner or admin */}
 {(recipe.userId === parseInt(session.user?.id || '0') || session.user?.role === 'admin') && (
 <Link
 href={`/edit-recipe/${recipe.id}`}
 onClick={(e) => e.stopPropagation()}
 className="p-1 sm:p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm bg-blue-500 text-white hover:bg-blue-600"
 title="Edit Recipe"
 >
 <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 </Link>
 )}
 <button
 onClick={(e) => toggleFavorite(recipe.id, e)}
 className={`p-1 sm:p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm ${
 favorites.has(recipe.id)
 ? 'bg-rose-500 text-white'
 : 'bg-white/90 text-gray-700 hover:bg-rose-100'
 }`}
 >
 <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={favorites.has(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </button>
 <button
 onClick={(e) => toggleSaved(recipe.id, e)}
 className={`p-1 sm:p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm ${
 savedRecipes.has(recipe.id)
 ? 'bg-purple-500 text-white'
 : 'bg-white/90 text-gray-700 hover:bg-purple-100'
 }`}
 >
 <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={savedRecipes.has(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
 </svg>
 </button>
 </div>
 )}

 {/* Servings Badge */}
 <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
 <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
 {recipe.servings} servings
 </span>
 </div>
 </div>

 {/* Recipe Info - Shopee Style */}
 <div className="p-2 sm:p-4">
 {/* Recipe Title */}
 <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
 {recipe.title}
 </h3>

 {/* Time Info - Compact */}
 <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
 <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="text-[10px] sm:text-xs text-gray-600">
 {recipe.prepTime + recipe.cookTime} min total
 </span>
 </div>

 {/* Time Details - Shopee Style */}
 <div className="flex items-center justify-between mb-2 sm:mb-3">
 <div className="flex gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
 <span>Prep: {recipe.prepTime}m</span>
 <span>•</span>
 <span>Cook: {recipe.cookTime}m</span>
 </div>
 </div>

 {/* View Recipe Button - Mobile Optimized */}
 <button
 className="w-full bg-warm-orange hover:bg-earth-brown text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 hover:shadow-lg hover:scale-105 active:scale-95"
 >
 <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
 </svg>
 <span className="hidden sm:inline">Start Cooking</span>
 <span className="sm:hidden">Cook</span>
 </button>
 </div>
 </Link>
 ))}
 </div>

 {/* Empty State - Mobile Optimized */}
 {!loading && filteredRecipes.length === 0 && (
 <div className="text-center py-12 sm:py-16 px-4">
 <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👨‍🍳</div>
 <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
 {recipes.length === 0 ? 'No recipes yet' : 'No recipes found'}
 </h3>
 <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
 {recipes.length === 0
 ? 'Be the first to add a recipe to our community!'
 : 'Try selecting a different difficulty level'}
 </p>
 {recipes.length === 0 ? (
 session && (
 <Link
 href="/profile"
 className="inline-block bg-warm-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-earth-brown transition-colors duration-300 text-sm sm:text-base"
 >
 Add Your First Recipe
 </Link>
 )
 ) : (
 <button
 onClick={() => setSelectedDifficulty('All')}
 className="bg-warm-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-earth-brown transition-colors duration-300 text-sm sm:text-base"
 >
 View All Recipes
 </button>
 )}
 </div>
 )}

 {/* Call to Action - Mobile Optimized */}
 {recipes.length > 0 && (
 <div className="text-center mt-8 sm:mt-16 px-3 sm:px-0">
 <div className="bg-gradient-to-r from-warm-orange to-earth-brown rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
 <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
 Share Your Creations!
 </h2>
 <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 opacity-90">
 Have you tried our recipes? Share your Lawlaw culinary masterpieces
 </p>
 {session ? (
 <Link
 href="/profile"
 className="inline-block bg-white text-warm-orange px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-accent-cream transition-colors duration-300"
 >
 Add Your Recipe
 </Link>
 ) : (
 <Link
 href="/register"
 className="inline-block bg-white text-warm-orange px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-accent-cream transition-colors duration-300"
 >
 Join Community
 </Link>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
