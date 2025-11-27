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

  // Recipes can now be added by admin, user, and seller roles
  // No default recipes will be seeded

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
