'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

interface Recipe {
  id: string;
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

  const toggleFavorite = async (recipeId: string) => {
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

  const toggleSaved = async (recipeId: string) => {
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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16 fade-in-up">
          <h1 className="text-5xl font-bold text-primary-green dark:text-green-400 mb-4">Culinary Adventures</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master the art of Filipino cooking with our step-by-step Lawlaw recipes, from beginner-friendly to advanced techniques
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedDifficulty === difficulty
                      ? 'bg-warm-orange text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700 hover:text-warm-orange'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="card-hover bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-64 image-overlay group">
                <Image
                  src={recipe.image || "/api/placeholder/400/250"}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    recipe.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
                    recipe.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {session && (
                    <>
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                          favorites.has(recipe.id)
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-rose-100'
                        }`}
                        title={favorites.has(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg className="w-5 h-5" fill={favorites.has(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleSaved(recipe.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                          savedRecipes.has(recipe.id)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-purple-100'
                        }`}
                        title={savedRecipes.has(recipe.id) ? 'Remove from saved' : 'Save recipe'}
                      >
                        <svg className="w-5 h-5" fill={savedRecipes.has(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                  Serves {recipe.servings}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary-green dark:text-green-400 mb-2">{recipe.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {recipe.prepTime + recipe.cookTime} min
                  </span>
                  <span>Prep: {recipe.prepTime}min | Cook: {recipe.cookTime}min</span>
                </div>

                <Link
                  href={`/recipes/${recipe.id}`}
                  className="btn-hover w-full bg-warm-orange text-white px-6 py-3 rounded-xl font-medium text-center hover:bg-earth-brown transition-colors duration-300 inline-block"
                >
                  Start Cooking
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {recipes.length === 0 ? 'No recipes yet' : 'No recipes found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {recipes.length === 0
                ? 'Be the first to add a recipe to our community!'
                : 'Try selecting a different difficulty level'}
            </p>
            {recipes.length === 0 ? (
              session && (
                <Link
                  href="/profile"
                  className="btn-hover inline-block bg-warm-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-earth-brown transition-colors duration-300"
                >
                  Add Your First Recipe
                </Link>
              )
            ) : (
              <button
                onClick={() => setSelectedDifficulty('All')}
                className="btn-hover bg-warm-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-earth-brown transition-colors duration-300"
              >
                View All Recipes
              </button>
            )}
          </div>
        )}

        {/* Call to Action */}
        {recipes.length > 0 && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-warm-orange to-earth-brown rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Share Your Creations!</h2>
              <p className="text-lg mb-6 opacity-90">
                Have you tried our recipes? Share your Lawlaw culinary masterpieces with the community
              </p>
              {session ? (
                <Link
                  href="/profile"
                  className="btn-hover inline-block bg-white text-warm-orange px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-cream transition-colors duration-300"
                >
                  Add Your Recipe
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="btn-hover inline-block bg-white text-warm-orange px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-cream transition-colors duration-300"
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
