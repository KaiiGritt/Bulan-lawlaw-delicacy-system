import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdminAccounts() {
  try {
    console.log('Updating admin accounts to mark them as verified...');

    const result = await prisma.user.updateMany({
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
