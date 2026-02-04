import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

function parseConnectionUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  };
}

async function verifyAdminAccounts() {
  const databaseUrl = process.env.DATABASE_URL!;
  const connectionConfig = parseConnectionUrl(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: connectionConfig.host,
    port: connectionConfig.port,
    user: connectionConfig.user,
    password: connectionConfig.password,
    database: connectionConfig.database,
    connectionLimit: 5,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Updating admin accounts to mark them as verified...');

    const result = await prisma.users.updateMany({
      where: {
        role: 'admin'
      },
      data: {
        emailVerified: true
      }
    });

    console.log(`✅ Successfully verified ${result.count} admin account(s)`);
    console.log('Admin users can now login without OTP verification.');
  } catch (error) {
    console.error('Error updating admin accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminAccounts();
