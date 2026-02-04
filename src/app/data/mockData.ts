// Mock data for Lawlaw Delights MVP

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'fresh' | 'dried' | 'processed';
  image: string;
  stock: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  recipe_ingredients: string[];
  recipe_instructions: string[];
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Lawlaw',
    description: 'Freshly caught Lawlaw fish, perfect for cooking.',
    price: 150,
    category: 'fresh',
    image: '/images/fresh-lawlaw.jpg',
    stock: 50,
  },
  {
    id: '2',
    name: 'Dried Lawlaw',
    description: 'Sun-dried Lawlaw, great for long-term storage.',
    price: 200,
    category: 'dried',
    image: '/images/dried-lawlaw.jpg',
    stock: 30,
  },
  {
    id: '3',
    name: 'Lawlaw Fillets',
    description: 'Processed Lawlaw fillets, ready to cook.',
    price: 180,
    category: 'processed',
    image: '/images/lawlaw-fillets.jpg',
    stock: 25,
  },
];

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Fried Lawlaw',
    description: 'A simple and delicious way to enjoy fresh Lawlaw.',
    recipe_ingredients: [
      '1 kg fresh Lawlaw',
      '2 cups flour',
      '2 eggs',
      'Salt and pepper to taste',
      'Oil for frying',
    ],
    recipe_instructions: [
      'Clean and prepare the Lawlaw by removing scales and guts.',
      'Mix flour, salt, and pepper in a bowl.',
      'Beat eggs in a separate bowl.',
      'Dip Lawlaw pieces in egg, then coat with flour mixture.',
      'Heat oil in a pan and fry until golden brown.',
      'Serve hot with your favorite dipping sauce.',
    ],
    image: '/images/fried-lawlaw.jpg',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'Beginner',
  },
  {
    id: '2',
    title: 'Lawlaw Patties',
    description: 'Crispy patties made from ground Lawlaw.',
    recipe_ingredients: [
      '500g ground Lawlaw',
      '1 onion, finely chopped',
      '2 cloves garlic, minced',
      '1 egg',
      '1/2 cup breadcrumbs',
      'Salt and pepper to taste',
      'Oil for frying',
    ],
    recipe_instructions: [
      'Mix all ingredients in a bowl until well combined.',
      'Form mixture into patties.',
      'Heat oil in a pan over medium heat.',
      'Fry patties until golden brown on both sides.',
      'Drain on paper towels and serve.',
    ],
    image: '/images/lawlaw-patties.jpg',
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: 'Beginner',
  },
  {
    id: '3',
    title: 'Crispy Lawlaw Rolls',
    description: 'Delicious spring rolls filled with Lawlaw.',
    recipe_ingredients: [
      '300g cooked Lawlaw, shredded',
      '1 carrot, julienned',
      '1 cup cabbage, shredded',
      'Spring roll wrappers',
      'Oil for frying',
      'Soy sauce for dipping',
    ],
    recipe_instructions: [
      'Mix Lawlaw, carrot, and cabbage in a bowl.',
      'Place mixture on spring roll wrappers and roll tightly.',
      'Seal edges with water.',
      'Heat oil and fry rolls until crispy.',
      'Serve with soy sauce.',
    ],
    image: '/images/lawlaw-rolls.jpg',
    prepTime: 25,
    cookTime: 10,
    servings: 6,
    difficulty: 'Intermediate',
  },
];
