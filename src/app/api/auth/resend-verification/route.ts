import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendOtpEmail } from '../../../lib/email'

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
    const body = await request.json()
    const email = (body.email || '').toString().trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }

    // Delete any existing OTPs for this user
    await prisma.otp.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otpCode = generateOTP(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await prisma.otp.create({
      data: {
        userId: user.userId,
        email,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP email
    try {
      await sendOtpEmail(user.email, user.name || 'User', otpCode)
      return NextResponse.json({
        message: 'Verification code sent successfully',
        redirectTo: `/verify-otp?email=${encodeURIComponent(email)}`
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
