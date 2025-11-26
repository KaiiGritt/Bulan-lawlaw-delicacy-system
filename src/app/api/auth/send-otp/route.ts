import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendOtpEmail } from '../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body.email || '').toString().trim().toLowerCase()
    const firstName = (body.firstName || '').toString().trim()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({
      where: { email }
    })

    // Create new OTP
    await prisma.otp.create({
      data: {
        email,
        code: otpCode,
        expiresAt
      }
    })

    // Send OTP email
    try {
      await sendOtpEmail(email, firstName || 'User', otpCode)
      console.log(`OTP sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
