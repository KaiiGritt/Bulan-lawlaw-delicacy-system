import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

function parseConnectionUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  }
}

async function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL!
  const connectionConfig = parseConnectionUrl(databaseUrl)
  const adapter = new PrismaMariaDb({
    host: connectionConfig.host,
    port: connectionConfig.port,
    user: connectionConfig.user,
    password: connectionConfig.password,
    database: connectionConfig.database,
    connectionLimit: 5,
  })
  return new PrismaClient({ adapter })
}

async function main() {
  const prisma = await createPrismaClient()

  try {
    // ==================== SEED USERS ====================

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.users.upsert({
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
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
