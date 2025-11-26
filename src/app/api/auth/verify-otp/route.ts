import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body.email || '').toString().trim().toLowerCase()
    const otp = (body.otp || '').toString().trim()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Find the OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code: otp
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      // Delete expired OTP using deleteMany to avoid errors if already deleted
      await prisma.otp.deleteMany({
        where: { id: otpRecord.id }
      })
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // OTP is valid, mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    })

    // Delete the used OTP using deleteMany to avoid errors if already deleted
    await prisma.otp.deleteMany({
      where: { id: otpRecord.id }
    })

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
