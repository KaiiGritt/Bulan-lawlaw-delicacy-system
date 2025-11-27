'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';
import ReviewsSection from '../../components/ReviewsSection';
import Modal from '../../components/Modal';
import {
 PrinterIcon,
 BookmarkIcon,
 ShareIcon,
 HeartIcon,
} from '@heroicons/react/24/outline';
import {
 BookmarkIcon as BookmarkSolidIcon,
 HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';

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
 rating: number;
 createdAt: string;
}

interface RecipePageProps {
 params: Promise<{
 id: string;
 }>;
}

export default function RecipePage({ params }: RecipePageProps) {
 const [recipe, setRecipe] = useState<Recipe | null>(null);
 const [loading, setLoading] = useState(true);
 const [isFavorite, setIsFavorite] = useState(false);
 const [isSaved, setIsSaved] = useState(false);
 const [showShareModal, setShowShareModal] = useState(false);
 const { data: session } = useSession();
 const router = useRouter();

 useEffect(() => {
 const fetchRecipe = async () => {
 try {
 const { id } = await params;
 const response = await fetch(`/api/recipes/${id}`);

 if (!response.ok) {
 if (response.status === 404) {
 notFound();
 }
 throw new Error('Failed to fetch recipe');
 }

 const data = await response.json();
 setRecipe(data);

 // Check if recipe is favorited or saved
 if (session) {
 checkFavoriteStatus(id);
 checkSavedStatus(id);
 }
 } catch (error) {
 console.error('Error fetching recipe:', error);
 toast.error('Failed to load recipe');
 } finally {
 setLoading(false);
 }
 };

 fetchRecipe();
 }, [params, session]);

 const checkFavoriteStatus = async (recipeId: string) => {
 try {
 const res = await fetch('/api/recipe-favorites');
 if (res.ok) {
 const data = await res.json();
 setIsFavorite(data.some((f: any) => f.recipeId === recipeId));
 }
 } catch (error) {
 console.error('Error checking favorite status:', error);
 }
 };

 const checkSavedStatus = async (recipeId: string) => {
 try {
 const res = await fetch('/api/saved-recipes');
 if (res.ok) {
 const data = await res.json();
 setIsSaved(data.some((s: any) => s.recipeId === recipeId));
 }
 } catch (error) {
 console.error('Error checking saved status:', error);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 px-4">
 <div className="max-w-4xl mx-auto">
 {/* Back Button Skeleton */}
 <div className="mb-6 animate-pulse">
 <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
 </div>

 {/* Recipe Header Skeleton */}
 <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
 {/* Image Skeleton */}
 <div className="h-64 sm:h-96 bg-gray-200"></div>

 <div className="p-6 sm:p-8">
 {/* Title & Meta Skeleton */}
 <div className="mb-6">
 <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
 <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
 <div className="flex flex-wrap gap-4 mb-4">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex items-center gap-2">
 <div className="w-5 h-5 bg-gray-200 rounded"></div>
 <div className="h-4 bg-gray-200 rounded w-20"></div>
 </div>
 ))}
 </div>
 </div>

 {/* Action Buttons Skeleton */}
 <div className="flex flex-wrap gap-3 mb-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-10 bg-gray-200 rounded-lg w-28"></div>
 ))}
 </div>

 {/* Ingredients Skeleton */}
 <div className="mb-6">
 <div className="h-7 bg-gray-200 rounded w-40 mb-4"></div>
 <div className="space-y-2">
 {[1, 2, 3, 4, 5].map((i) => (
 <div key={i} className="h-5 bg-gray-200 rounded w-full"></div>
 ))}
 </div>
 </div>

 {/* Instructions Skeleton */}
 <div>
 <div className="h-7 bg-gray-200 rounded w-40 mb-4"></div>
 <div className="space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="space-y-2">
 <div className="h-5 bg-gray-200 rounded w-full"></div>
 <div className="h-5 bg-gray-200 rounded w-5/6"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (!recipe) {
 notFound();
 }

 const handlePrint = () => {
 const printWindow = window.open('', '_blank');
 if (!printWindow) {
 toast.error('Please allow popups to print the recipe');
 return;
 }

 const printContent = `
 <!DOCTYPE html>
 <html>
 <head>
 <title>${recipe.title} - Lawlaw Delights Recipe</title>
 <style>
 @media print {
 @page {
 margin: 1cm;
 }
 }
 body {
 font-family: Arial, sans-serif;
 line-height: 1.6;
 color: #333;
 max-width: 800px;
 margin: 0 auto;
 padding: 20px;
 }
 .header {
 text-align: center;
 border-bottom: 3px solid #10b981;
 padding-bottom: 20px;
 margin-bottom: 30px;
 }
 h1 {
 color: #10b981;
 margin: 0 0 10px 0;
 }
 .meta {
 display: flex;
 justify-content: center;
 gap: 30px;
 margin: 20px 0;
 flex-wrap: wrap;
 }
 .meta-item {
 text-align: center;
 }
 .meta-value {
 font-size: 20px;
 font-weight: bold;
 color: #10b981;
 }
 .meta-label {
 font-size: 14px;
 color: #666;
 }
 .section {
 margin: 30px 0;
 }
 h2 {
 color: #10b981;
 border-bottom: 2px solid #10b981;
 padding-bottom: 10px;
 margin-bottom: 15px;
 }
 .ingredients li {
 margin: 8px 0;
 list-style: none;
 padding-left: 20px;
 position: relative;
 }
 .ingredients li:before {
 content: "•";
 color: #10b981;
 font-weight: bold;
 position: absolute;
 left: 0;
 }
 .instructions li {
 margin: 15px 0;
 padding-left: 40px;
 position: relative;
 }
 .step-number {
 position: absolute;
 left: 0;
 top: 0;
 background: #10b981;
 color: white;
 width: 30px;
 height: 30px;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 font-weight: bold;
 }
 .footer {
 text-align: center;
 margin-top: 40px;
 padding-top: 20px;
 border-top: 2px solid #10b981;
 color: #666;
 }
 </style>
 </head>
 <body>
 <div class="header">
 <h1>${recipe.title}</h1>
 <p>${recipe.description}</p>
 <div class="badge">${recipe.difficulty} Level</div>
 </div>

 <div class="meta">
 <div class="meta-item">
 <div class="meta-value">${recipe.prepTime} min</div>
 <div class="meta-label">Prep Time</div>
 </div>
 <div class="meta-item">
 <div class="meta-value">${recipe.cookTime} min</div>
 <div class="meta-label">Cook Time</div>
 </div>
 <div class="meta-item">
 <div class="meta-value">${recipe.servings}</div>
 <div class="meta-label">Servings</div>
 </div>
 </div>

 <div class="section">
 <h2>Ingredients</h2>
 <ul class="ingredients">
 ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
 </ul>
 </div>

 <div class="section">
 <h2>Instructions</h2>
 <ol class="instructions">
 ${recipe.instructions.map((instruction, index) => `
 <li>
 <div class="step-number">${index + 1}</div>
 ${instruction}
 </li>
 `).join('')}
 </ol>
 </div>

 <div class="footer">
 <p><strong>Recipe from Lawlaw Delights</strong></p>
 <p>Fresh Lawlaw seafood from Bulan, Sorsogon</p>
 </div>
 </body>
 </html>
 `;

 printWindow.document.write(printContent);
 printWindow.document.close();

 printWindow.onload = () => {
 printWindow.print();
 printWindow.onafterprint = () => {
 printWindow.close();
 };
 };

 toast.success('Opening print dialog...');
 };

 const handleShare = async () => {
 setShowShareModal(true);
 };

 const handleCopyLink = () => {
 navigator.clipboard.writeText(window.location.href);
 toast.success('Recipe link copied to clipboard!');
 };

 const handleToggleFavorite = async () => {
 if (!session) {
 toast.error('Please login to favorite recipes');
 router.push('/login');
 return;
 }

 if (!recipe) return;

 try {
 if (isFavorite) {
 const res = await fetch(`/api/recipe-favorites?recipeId=${recipe.id}`, {
 method: 'DELETE'
 });
 if (res.ok) {
 setIsFavorite(false);
 toast.success('Removed from favorites');
 }
 } else {
 const res = await fetch('/api/recipe-favorites', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ recipeId: recipe.id })
 });
 if (res.ok) {
 setIsFavorite(true);
 toast.success('Added to favorites!');
 }
 }
 } catch (error) {
 console.error('Error toggling favorite:', error);
 toast.error('Failed to update favorites');
 }
 };

 const handleToggleSave = async () => {
 if (!session) {
 toast.error('Please login to save recipes');
 router.push('/login');
 return;
 }

 if (!recipe) return;

 try {
 if (isSaved) {
 const res = await fetch(`/api/saved-recipes?recipeId=${recipe.id}`, {
 method: 'DELETE'
 });
 if (res.ok) {
 setIsSaved(false);
 toast.success('Removed from saved recipes');
 }
 } else {
 const res = await fetch('/api/saved-recipes', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ recipeId: recipe.id })
 });
 if (res.ok) {
 setIsSaved(true);
 toast.success('Recipe saved!');
 }
 }
 } catch (error) {
 console.error('Error toggling saved:', error);
 toast.error('Failed to update saved recipes');
 }
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-12">
 <Toaster position="top-right" />
 <div className="container mx-auto px-4">
 <div className="max-w-4xl mx-auto">
 {/* Back Button */}
 <div className="mb-6">
 <Link
 href="/recipes"
 className="btn-hover inline-flex items-center text-primary-green hover:text-leaf-green transition-colors duration-200"
 >
 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 Back to Recipes
 </Link>
 </div>

 {/* Recipe Header */}
 <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-8 mb-8 fade-in-up">
 <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
 {/* Recipe Image */}
 <div className="lg:w-1/2 mb-6 lg:mb-0">
 <div className="relative h-80 lg:h-96 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
 <Image
 src={recipe.image || "/api/placeholder/400/300"}
 alt={recipe.title}
 fill
 className="object-cover"
 />
 <div className="absolute top-4 left-4">
 <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
 recipe.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
 recipe.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
 'bg-red-100 text-red-800'
 }`}>
 {recipe.difficulty}
 </span>
 </div>
 {/* Favorite Badge */}
 <button
 onClick={handleToggleFavorite}
 className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
 >
 {isFavorite ? (
 <HeartSolidIcon className="w-6 h-6 text-red-500" />
 ) : (
 <HeartIcon className="w-6 h-6 text-gray-600" />
 )}
 </button>
 </div>
 </div>

 {/* Recipe Info */}
 <div className="lg:w-1/2">
 <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent mb-4">{recipe.title}</h1>
 <p className="text-xl text-gray-600 mb-6 leading-relaxed">{recipe.description}</p>

 <div className="grid grid-cols-3 gap-4 mb-6">
 <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
 <div className="text-2xl font-bold text-primary-green">{recipe.prepTime}</div>
 <div className="text-sm text-gray-600">Prep Time</div>
 </div>
 <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
 <div className="text-2xl font-bold text-primary-green">{recipe.cookTime}</div>
 <div className="text-sm text-gray-600">Cook Time</div>
 </div>
 <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
 <div className="text-2xl font-bold text-primary-green">{recipe.servings}</div>
 <div className="text-sm text-gray-600">Servings</div>
 </div>
 </div>

 <div className="flex flex-wrap gap-3">
 <button
 onClick={handlePrint}
 className="btn-hover bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
 >
 <PrinterIcon className="w-5 h-5" />
 Print Recipe
 </button>
 <button
 onClick={handleToggleSave}
 className="btn-hover bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
 >
 {isSaved ? (
 <BookmarkSolidIcon className="w-5 h-5" />
 ) : (
 <BookmarkIcon className="w-5 h-5" />
 )}
 {isSaved ? 'Saved' : 'Save Recipe'}
 </button>
 <button
 onClick={handleShare}
 className="btn-hover bg-gradient-to-r from-warm-orange to-earth-brown hover:from-earth-brown hover:to-warm-orange text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
 >
 <ShareIcon className="w-5 h-5" />
 Share Recipe
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Ingredients */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
 <h2 className="text-2xl font-bold text-primary-green mb-6 flex items-center gap-2">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 Ingredients
 </h2>
 <ul className="space-y-3">
 {recipe.ingredients.map((ingredient, index) => (
 <li key={index} className="flex items-start">
 <span className="w-2 h-2 bg-primary-green rounded-full mr-4 mt-2 flex-shrink-0"></span>
 <span className="text-gray-700 leading-relaxed">{ingredient}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Instructions */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-2xl shadow-lg border border-soft-green/20 p-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
 <h2 className="text-2xl font-bold text-primary-green mb-6 flex items-center gap-2">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
 </svg>
 Instructions
 </h2>
 <ol className="space-y-6">
 {recipe.instructions.map((instruction, index) => (
 <li key={index} className="flex">
 <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-green to-leaf-green text-white rounded-full flex items-center justify-center text-lg font-bold mr-6 shadow-md">
 {index + 1}
 </span>
 <p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
 </li>
 ))}
 </ol>
 </div>
 </div>
 </div>

 {/* Reviews Section */}
 <div className="mt-12 fade-in-up" style={{ animationDelay: '0.3s' }}>
 <ReviewsSection
 itemId={recipe.id}
 itemType="recipe"
 itemName={recipe.title}
 />
 </div>


 {/* Call to Action */}
 <div className="mt-12 text-center bg-gradient-to-r from-primary-green to-banana-leaf rounded-2xl p-8 text-white fade-in-up" style={{ animationDelay: '0.5s' }}>
 <h2 className="text-3xl font-bold mb-4">Ready to Cook?</h2>
 <p className="text-xl mb-6 opacity-90">Get fresh Lawlaw ingredients delivered to your door</p>
 <Link
 href="/products"
 className="btn-hover inline-block bg-white text-primary-green px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
 >
 Shop Lawlaw Products →
 </Link>
 </div>
 </div>
 </div>

 {/* Share Modal */}
 <Modal
 isOpen={showShareModal}
 onClose={() => setShowShareModal(false)}
 title="Share Recipe"
 size="md"
 >
 <div className="space-y-4">
 <p className="text-sm sm:text-base text-gray-600 mb-4">
 Share this delicious {recipe.title} recipe with your friends!
 </p>

 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={async () => {
 if (navigator.share) {
 try {
 await navigator.share({
 title: recipe.title,
 text: `Check out this recipe: ${recipe.title}`,
 url: window.location.href,
 });
 toast.success('Shared successfully!');
 setShowShareModal(false);
 } catch (err) {
 if ((err as Error).name !== 'AbortError') {
 handleCopyLink();
 }
 }
 } else {
 handleCopyLink();
 }
 }}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-green text-white rounded-lg hover:bg-leaf-green transition-colors text-sm sm:text-base font-medium"
 >
 <ShareIcon className="w-5 h-5" />
 Share
 </button>

 <button
 onClick={() => {
 handleCopyLink();
 setShowShareModal(false);
 }}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
 </svg>
 Copy Link
 </button>
 </div>

 <div className="pt-4 border-t border-gray-200">
 <p className="text-xs sm:text-sm text-gray-500 text-center">
 {window.location.href}
 </p>
 </div>
 </div>
 </Modal>
 </div>
 );
}
