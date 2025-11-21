import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lawlawdelights.com' },
    update: {},
    create: {
      email: 'admin@lawlawdelights.com',
      name: 'Admin',
      password: adminPassword,
      role: 'admin'
    }
  })

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@lawlawdelights.com' },
    update: {},
    create: {
      email: 'user@lawlawdelights.com',
      name: 'Test User',
      password: userPassword,
      role: 'user'
    }
  })

  // Create seller application for test user
  await prisma.sellerApplication.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      businessName: 'Test Seller Business',
      businessType: 'Retail',
      description: 'A test seller application for demonstration purposes.',
      contactNumber: '+1234567890',
      address: '123 Test Street, Test City',
      status: 'pending'
    }
  })

  // Create products
  const products = [
    {
      id: '1',
      name: 'Fresh Lawlaw',
      description: 'Freshly caught Lawlaw fish, perfect for cooking.',
      price: 150,
      category: 'fresh',
      image: '/images/fresh-lawlaw.jpg',
      stock: 50,
      userId: user.id,
    },
    {
      id: '2',
      name: 'Dried Lawlaw',
      description: 'Sun-dried Lawlaw, great for long-term storage.',
      price: 200,
      category: 'dried',
      image: '/images/dried-lawlaw.jpg',
      stock: 30,
      userId: user.id,
    },
    {
      id: '3',
      name: 'Lawlaw Fillets',
      description: 'Processed Lawlaw fillets, ready to cook.',
      price: 180,
      category: 'processed',
      image: '/images/lawlaw-fillets.jpg',
      stock: 25,
      userId: user.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product
    })
  }

  // Create recipes
  const recipes = [
    {
      id: '1',
      title: 'Fried Lawlaw',
      description: 'A simple and delicious way to enjoy fresh Lawlaw.',
      ingredients: JSON.stringify([
        '1 kg fresh Lawlaw',
        '2 cups flour',
        '2 eggs',
        'Salt and pepper to taste',
        'Oil for frying',
      ]),
      instructions: JSON.stringify([
        'Clean and prepare the Lawlaw by removing scales and guts.',
        'Mix flour, salt, and pepper in a bowl.',
        'Beat eggs in a separate bowl.',
        'Dip Lawlaw pieces in egg, then coat with flour mixture.',
        'Heat oil in a pan and fry until golden brown.',
        'Serve hot with your favorite dipping sauce.',
      ]),
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
      ingredients: JSON.stringify([
        '500g ground Lawlaw',
        '1 onion, finely chopped',
        '2 cloves garlic, minced',
        '1 egg',
        '1/2 cup breadcrumbs',
        'Salt and pepper to taste',
        'Oil for frying',
      ]),
      instructions: JSON.stringify([
        'Mix all ingredients in a bowl until well combined.',
        'Form mixture into patties.',
        'Heat oil in a pan over medium heat.',
        'Fry patties until golden brown on both sides.',
        'Drain on paper towels and serve.',
      ]),
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
      ingredients: JSON.stringify([
        '300g cooked Lawlaw, shredded',
        '1 carrot, julienned',
        '1 cup cabbage, shredded',
        'Spring roll wrappers',
        'Oil for frying',
        'Soy sauce for dipping',
      ]),
      instructions: JSON.stringify([
        'Mix Lawlaw, carrot, and cabbage in a bowl.',
        'Place mixture on spring roll wrappers and roll tightly.',
        'Seal edges with water.',
        'Heat oil and fry rolls until crispy.',
        'Serve with soy sauce.',
      ]),
      image: '/images/lawlaw-rolls.jpg',
      prepTime: 25,
      cookTime: 10,
      servings: 6,
      difficulty: 'Intermediate',
    },
  ]

  for (const recipe of recipes) {
    await prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {},
      create: recipe
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin credentials: admin@lawlawdelights.com / admin123')
  console.log('User credentials: user@lawlawdelights.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
