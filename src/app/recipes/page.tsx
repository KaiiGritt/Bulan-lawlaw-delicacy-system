'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { mockRecipes } from '../data/mockData';

export default function RecipesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filteredRecipes = selectedDifficulty === 'All'
    ? mockRecipes
    : mockRecipes.filter(recipe => recipe.difficulty === selectedDifficulty);

  return (
    <div className="main-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16 fade-in-up">
          <h1 className="text-5xl font-bold text-primary-green mb-4">Culinary Adventures</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master the art of Filipino cooking with our step-by-step Lawlaw recipes, from beginner-friendly to advanced techniques
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
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

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 fade-in-up"
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
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                  {recipe.prepTime + recipe.cookTime} min
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                  Serves {recipe.servings}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary-green mb-2">{recipe.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Prep: {recipe.prepTime}min</span>
                  <span>Cook: {recipe.cookTime}min</span>
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
        {filteredRecipes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-6">Try selecting a different difficulty level</p>
            <button
              onClick={() => setSelectedDifficulty('All')}
              className="btn-hover bg-warm-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-earth-brown transition-colors duration-300"
            >
              View All Recipes
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-warm-orange to-earth-brown rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Share Your Creations!</h2>
            <p className="text-lg mb-6 opacity-90">
              Have you tried our recipes? Share your Lawlaw culinary masterpieces with the community
            </p>
            <Link
              href="/register"
              className="btn-hover inline-block bg-white text-warm-orange px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-cream transition-colors duration-300"
            >
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
