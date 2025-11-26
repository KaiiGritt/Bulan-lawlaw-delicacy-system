import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await prisma.whatsAppOTP.findUnique({
      where: { phoneNumber },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No OTP found for this phone number' },
        { status: 404 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.whatsAppOTP.update({
      where: { phoneNumber },
      data: { verified: true },
    });

    // Check if user exists with this phone number
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Create new user with WhatsApp phone number
      user = await prisma.user.create({
        data: {
          phoneNumber,
          name: `User ${phoneNumber.slice(-4)}`,
          email: `${phoneNumber}@whatsapp.user`, // Placeholder email
          password: '', // No password for WhatsApp users
          role: 'user',
          emailVerified: true, // WhatsApp users are auto-verified
        },
      });
    } else {
      // Update existing user verification status
      await prisma.user.update({
        where: { phoneNumber },
        data: { emailVerified: true },
      });
    }

    // Create session manually or use a custom token
    // For now, return success with user data
    return NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying WhatsApp OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
