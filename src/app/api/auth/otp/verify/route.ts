import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await prisma.otps.findFirst({
      where: {
        email,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otps.delete({ where: { otpId: otpRecord.otpId } });
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await prisma.otps.delete({ where: { otpId: otpRecord.otpId } });
      return NextResponse.json(
        { error: 'Maximum attempts exceeded. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Verify the OTP code
    if (otpRecord.code !== code) {
      // Increment attempts
      await prisma.otps.update({
        where: { otpId: otpRecord.otpId },
        data: { attempts: otpRecord.attempts + 1 },
      });

      const remainingAttempts = MAX_ATTEMPTS - (otpRecord.attempts + 1);

      return NextResponse.json(
        {
          error: `Incorrect OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is correct - mark as verified
    await prisma.otps.update({
      where: { otpId: otpRecord.otpId },
      data: { verified: true },
    });

    // Check if this is a new registration (pending registration exists)
    const pendingRegistration = await prisma.pending_registrations.findUnique({
      where: { email },
    });

    if (pendingRegistration) {
      // Check if pending registration has expired
      if (new Date() > pendingRegistration.expiresAt) {
        // Clean up expired pending registration
        await prisma.pending_registrations.delete({ where: { email } });
        await prisma.otps.deleteMany({ where: { email } });

        return NextResponse.json(
          { error: 'Registration has expired. Please register again.' },
          { status: 400 }
        );
      }

      // Create the actual user from pending registration
      const user = await prisma.users.create({
        data: {
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          phoneNumber: pendingRegistration.phoneNumber,
          password: pendingRegistration.password,
          role: pendingRegistration.role,
          emailVerified: true // Already verified via OTP
        },
      });

      // Delete the pending registration
      await prisma.pending_registrations.delete({ where: { email } });

      // Clean up all OTPs for this email
      await prisma.otps.deleteMany({ where: { email } });

      console.log('User created successfully after OTP verification:', user.email);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully! You can now login.',
        isNewUser: true,
      });
    }

    // If no pending registration, this might be for an existing user (e.g., resend verification)
    // Update user's email verification status if user exists
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.users.update({
        where: { email },
        data: { emailVerified: true },
      });
    }

    // Clean up old OTPs for this email
    await prisma.otps.deleteMany({
      where: {
        email,
        otpId: { not: otpRecord.otpId },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      isNewUser: false,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
