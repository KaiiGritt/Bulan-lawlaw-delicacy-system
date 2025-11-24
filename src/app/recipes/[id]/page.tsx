import { notFound } from 'next/navigation';
import { mockRecipes } from '../../data/mockData';
import Link from 'next/link';
import Image from 'next/image';

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = mockRecipes.find(r => r.id === id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12">
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
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 fade-in-up">
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
                </div>
              </div>

              {/* Recipe Info */}
              <div className="lg:w-1/2">
                <h1 className="text-4xl font-bold text-primary-green mb-4">{recipe.title}</h1>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">{recipe.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-cream-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-green">{recipe.prepTime}</div>
                    <div className="text-sm text-gray-600">Prep Time</div>
                  </div>
                  <div className="text-center p-4 bg-cream-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-green">{recipe.cookTime}</div>
                    <div className="text-sm text-gray-600">Cook Time</div>
                  </div>
                  <div className="text-center p-4 bg-cream-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-green">{recipe.servings}</div>
                    <div className="text-sm text-gray-600">Servings</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-leaf-green transition-colors duration-200 font-medium">
                    🖨️ Print Recipe
                  </button>
                  <button className="btn-hover bg-banana-leaf text-white px-6 py-3 rounded-xl hover:bg-primary-green transition-colors duration-200 font-medium">
                    💾 Save Recipe
                  </button>
                  <button className="btn-hover bg-warm-orange text-white px-6 py-3 rounded-xl hover:bg-earth-brown transition-colors duration-200 font-medium">
                    📤 Share Recipe
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold text-primary-green mb-6 flex items-center">
                  <span className="text-3xl mr-3">🥘</span>
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
              <div className="bg-white rounded-2xl shadow-lg p-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold text-primary-green mb-6 flex items-center">
                  <span className="text-3xl mr-3">👨‍🍳</span>
                  Instructions
                </h2>
                <ol className="space-y-6">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 w-10 h-10 bg-primary-green text-white rounded-full flex items-center justify-center text-lg font-bold mr-6 shadow-md">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Related Recipes Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-primary-green mb-6">More Lawlaw Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockRecipes
                .filter(r => r.id !== recipe.id)
                .slice(0, 3)
                .map((relatedRecipe) => (
                  <Link
                    key={relatedRecipe.id}
                    href={`/recipes/${relatedRecipe.id}`}
                    className="card-hover group"
                  >
                    <div className="bg-gray-100 h-48 rounded-xl overflow-hidden mb-4 relative">
                      <Image
                        src={relatedRecipe.image || "/api/placeholder/300/200"}
                        alt={relatedRecipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-primary-green mb-2 group-hover:text-leaf-green transition-colors duration-200">
                      {relatedRecipe.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{relatedRecipe.description}</p>
                  </Link>
                ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary-green to-banana-leaf rounded-2xl p-8 text-white fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-bold mb-4">Ready to Cook?</h2>
            <p className="text-xl mb-6 opacity-90">Get fresh Lawlaw ingredients delivered to your door</p>
            <Link
              href="/products"
              className="btn-hover inline-block bg-white text-primary-green px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Shop Lawlaw Products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
