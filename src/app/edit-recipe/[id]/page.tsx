'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

interface Recipe {
  id: string;
  userId: number | null;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
}

export default function EditRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Beginner',
    image: '',
  });

  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && recipeId) {
      fetchRecipe();
    }
  }, [status, recipeId]);

  const fetchRecipe = async () => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (!res.ok) {
        toast.error('Recipe not found');
        router.push('/recipes');
        return;
      }

      const recipe: Recipe = await res.json();

      // Check if user is owner or admin
      const isOwner = recipe.userId === parseInt(session?.user?.id || '0');
      const isAdmin = session?.user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        toast.error('You are not authorized to edit this recipe');
        router.push('/recipes');
        return;
      }

      setFormData({
        title: recipe.title,
        description: recipe.description,
        prepTime: String(recipe.prepTime),
        cookTime: String(recipe.cookTime),
        servings: String(recipe.servings),
        difficulty: recipe.difficulty,
        image: recipe.image,
      });

      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : ['']);
      setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);
      setImagePreview(recipe.image);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const filteredIngredients = ingredients.filter(i => i.trim() !== '');
      const filteredInstructions = instructions.filter(i => i.trim() !== '');

      if (filteredIngredients.length === 0) {
        toast.error('Please add at least one ingredient');
        setIsSubmitting(false);
        return;
      }

      if (filteredInstructions.length === 0) {
        toast.error('Please add at least one instruction');
        setIsSubmitting(false);
        return;
      }

      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const uploadRes = await fetch('/api/upload/recipe', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Image upload failed');
        }

        const { imageUrl: newImageUrl } = await uploadRes.json();
        imageUrl = newImageUrl;
      }

      const recipeData = {
        title: formData.title,
        description: formData.description,
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        servings: parseInt(formData.servings),
        difficulty: formData.difficulty,
        image: imageUrl,
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
      };

      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update recipe');
      }

      toast.success('Recipe updated successfully!');
      setTimeout(() => {
        router.push(`/recipes/${recipeId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      toast.error(error.message || 'Failed to update recipe');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

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
      setTimeout(() => {
        router.push('/recipes');
      }, 1500);
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast.error(error.message || 'Failed to delete recipe');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-12 px-3 sm:px-4">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-soft-green/20 p-4 sm:p-6 lg:p-8"
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link href={`/recipes/${recipeId}`} className="text-primary-green hover:text-leaf-green flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Recipe
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <svg className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Recipe
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                  Update your recipe details
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 sm:p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                title="Delete Recipe"
              >
                {isDeleting ? (
                  <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Recipe Title */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Crispy Fried Lawlaw"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm sm:text-base"
                  rows={3}
                  placeholder="Describe your recipe..."
                  required
                />
              </div>

              {/* Prep Time */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Prep Time (min) *
                </label>
                <input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm sm:text-base"
                  placeholder="15"
                  min="0"
                  required
                />
              </div>

              {/* Cook Time */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Cook Time (min) *
                </label>
                <input
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm sm:text-base"
                  placeholder="30"
                  min="0"
                  required
                />
              </div>

              {/* Servings */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Servings *
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm sm:text-base"
                  placeholder="4"
                  min="1"
                  required
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Recipe Image */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">
                  Recipe Image (leave empty to keep current)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4
                    file:rounded-lg file:border-0
                    file:text-xs sm:file:text-sm file:font-semibold
                    file:bg-primary-green file:text-white
                    hover:file:bg-leaf-green
                    file:cursor-pointer cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Current Image:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 sm:h-64 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 sm:p-6 border border-green-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-800">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ingredients *
                </label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-primary-green hover:text-leaf-green flex items-center gap-1 text-xs sm:text-sm font-medium bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Ingredient</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-9 sm:w-7 sm:h-10 flex items-center justify-center bg-primary-green/20 text-primary-green rounded-lg font-semibold text-xs sm:text-sm">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="flex-1 p-2 sm:p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-xs sm:text-sm"
                      placeholder={`e.g., 500g Lawlaw`}
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="flex-shrink-0 p-2 sm:p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-800">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Instructions *
                </label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs sm:text-sm font-medium bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Step</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md">
                      {index + 1}
                    </div>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 p-2 sm:p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent text-xs sm:text-sm"
                      rows={2}
                      placeholder={`Step ${index + 1} instructions...`}
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="flex-shrink-0 p-2 h-9 sm:h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="hidden sm:inline">Updating Recipe...</span>
                    <span className="sm:hidden">Updating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Recipe
                  </>
                )}
              </button>
              <Link
                href={`/recipes/${recipeId}`}
                className="sm:flex-initial px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
