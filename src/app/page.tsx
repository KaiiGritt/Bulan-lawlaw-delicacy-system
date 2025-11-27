'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  image: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect logged-in users to profile
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/profile');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, recipesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/recipes')
        ]);

        if (productsRes.ok) {
          const products = await productsRes.json();
          setFeaturedProducts(products.slice(0, 3)); // Get first 3 products
        }

        if (recipesRes.ok) {
          const recipes = await recipesRes.json();
          setFeaturedRecipes(recipes.slice(0, 3)); // Get first 3 recipes
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-green/20 to-banana-leaf/20"></div>
        <div className="absolute inset-0 leaf-texture"></div>

        {/* Parallax background */}
        <div className="absolute inset-0 parallax">
          <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-banana-leaf/10 rounded-full blur-xl"></div>
          <div className="floating-orb absolute bottom-20 right-10 w-48 h-48 bg-warm-orange/10 rounded-full blur-xl" style={{ animationDelay: '3s' }}></div>
          <div className="pulsing-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-leaf-green/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-green mb-6 leading-tight">
              Authentic <span className="text-warm-orange">Lawlaw</span> Delicacies
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover the finest seafood treasures from Bulan, Sorsogon. Fresh, sustainable, and bursting with Filipino flavor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="btn-hover bg-primary-green text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Shop Fresh Lawlaw
              </Link>
              <Link
                href="/recipes"
                className="btn-hover bg-white text-primary-green px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-primary-green transition-all duration-300"
              >
                Learn to Cook
              </Link>
            </div>
          </div>
        </div>

        {/* Floating steam effect */}
        <div className="absolute bottom-32 left-1/4 steam-effect">
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
        </div>
        <div className="absolute bottom-40 left-1/3 steam-effect" style={{ animationDelay: '1s' }}>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
        </div>
        <div className="absolute bottom-28 left-2/3 steam-effect" style={{ animationDelay: '2s' }}>
          <div className="w-2.5 h-2.5 bg-white/50 rounded-full"></div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-green mb-4">Bestselling Delicacies</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked selections from our trusted fishermen partners
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative h-64 image-overlay">
                    <Image
                      src={product.image || "/api/placeholder/400/300"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-warm-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                      ₱{product.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-green mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <Link
                      href={`/products/${product.id}`}
                      className="btn-hover inline-block bg-primary-green text-white px-6 py-3 rounded-xl font-medium hover:bg-leaf-green transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="btn-hover inline-block bg-banana-leaf text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-leaf-green transition-colors duration-300"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-20 bg-gradient-to-r from-accent-cream to-banana-leaf/10 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-green mb-4">Culinary Adventures</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master the art of Filipino cooking with our step-by-step guides
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-2xl h-72 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative h-48 image-overlay">
                    <Image
                      src={recipe.image || "/api/placeholder/400/250"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary-green">
                      {recipe.difficulty}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {recipe.prepTime + recipe.cookTime} mins
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-green mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 mb-4">{recipe.description}</p>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="btn-hover inline-block bg-warm-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-earth-brown transition-colors duration-300"
                    >
                      Start Cooking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/recipes"
              className="btn-hover inline-block bg-primary-green text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-leaf-green transition-colors duration-300"
            >
              Explore All Recipes →
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary-green text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Join Our Culinary Community</h2>
            <p className="text-xl mb-8 opacity-90">
              Connect with fellow food enthusiasts, share your Lawlaw creations, and discover new ways to enjoy this Filipino delicacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-hover bg-white text-primary-green px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-accent-cream transition-colors duration-300"
              >
                Join Community
              </Link>
              <Link
                href="/login"
                className="btn-hover bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary-green transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
