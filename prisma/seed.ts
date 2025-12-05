import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ==================== SEED USERS ====================

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lawlawdelights.com' },
    update: {},
    create: {
      email: 'admin@lawlawdelights.com',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
      emailVerified: true
    }
  })

  console.log('Database seeded successfully!')
  console.log('Admin credentials: admin@lawlawdelights.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
