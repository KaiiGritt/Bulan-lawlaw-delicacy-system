import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (you need to create a WhatsAppOTP model in your schema)
    await prisma.whatsAppOTP.upsert({
      where: { phoneNumber },
      update: {
        otp,
        expiresAt,
        verified: false,
      },
      create: {
        phoneNumber,
        otp,
        expiresAt,
        verified: false,
      },
    });

    // TODO: Send OTP via WhatsApp API (Twilio, WhatsApp Business API, etc.)
    // For now, we'll just return success (in production, integrate with WhatsApp API)

    console.log(`OTP for ${phoneNumber}: ${otp}`); // For development only

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully',
        // Remove this in production - only for development
        devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
