import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendOtpEmail } from '@/app/lib/email';

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

    // Check if user exists OR if there's a pending registration
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    // If neither user nor pending registration exists, return error
    if (!user && !pendingRegistration) {
      return NextResponse.json({ error: 'No account found for this email. Please register first.' }, { status: 404 });
    }

    // Check if pending registration has expired
    if (pendingRegistration && new Date() > pendingRegistration.expiresAt) {
      // Clean up expired pending registration
      await prisma.pendingRegistration.delete({ where: { email } });
      await prisma.otp.deleteMany({ where: { email } });
      return NextResponse.json({ error: 'Registration has expired. Please register again.' }, { status: 400 });
    }

    // Get the name from either user or pending registration
    const name = user?.name || pendingRegistration?.name || 'User';

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otpCode = generateOTP(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database (userId is optional - null for pending registrations)
    await prisma.otp.create({
      data: {
        userId: user?.userId || null,
        email,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP email (with fallback logging)
    await sendOtpEmail(email, name, otpCode);

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
