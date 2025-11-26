import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendOtpEmail } from '@/app/lib/email';

const prisma = new PrismaClient();

// Generate a random OTP code
function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otpCode = generateOTP(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await prisma.otp.create({
      data: {
        email,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP email (with fallback logging)
    await sendOtpEmail(email, user.name || 'User', otpCode);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresAt,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
