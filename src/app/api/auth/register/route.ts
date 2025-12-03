import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { sendOtpEmail } from '../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const firstName = (body.firstName || '').toString().trim()
    const lastName = (body.lastName || '').toString().trim()
    const email = (body.email || '').toString().trim().toLowerCase()
    const phoneNumber = (body.phoneNumber || '').toString().trim() || null // Optional phone number
    const password = (body.password || '').toString()
    const role = (body.role || 'user').toString() // Optional role parameter

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Basic email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate phone number format if provided (Philippine format)
    if (phoneNumber && !/^(09|\+639)\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format. Use 09XXXXXXXXX or +639XXXXXXXXX' }, { status: 400 })
    }

    // Check if user already exists (case-insensitive via stored lowercased email)
    const existingUser = await prisma.user.findUnique({ where: { email } })

    // Check if phone number is already in use (if provided)
    if (phoneNumber) {
      const existingPhone = await prisma.user.findUnique({ where: { phoneNumber } })
      if (existingPhone) {
        return NextResponse.json({ error: 'Phone number is already registered' }, { status: 400 })
      }
    }

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine if admin (admin accounts don't need email verification - mockup emails)
    const isAdmin = role === 'admin'

    const fullName = `${firstName} ${lastName}`

    // For admin users, create directly in the User table (no OTP needed)
    if (isAdmin) {
      const user = await prisma.user.create({
        data: {
          name: fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          role: role,
          emailVerified: true // Admins are auto-verified
        }
      })

      console.log('Admin user created - skipping OTP verification')

      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        message: 'Admin account created successfully. You can login directly.',
        user: userWithoutPassword,
        redirectTo: '/login'
      }, { status: 201 })
    }

    // For regular users, store in PendingRegistration table (NOT in User table)
    // User will only be created after OTP verification

    // Delete any existing pending registration for this email
    await prisma.pendingRegistration.deleteMany({
      where: { email },
    })

    // Create pending registration (expires in 30 minutes)
    const pendingExpiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await prisma.pendingRegistration.create({
      data: {
        name: fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: role,
        expiresAt: pendingExpiresAt,
      },
    })

    // Generate and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({
      where: { email },
    })

    // Save OTP to database
    await prisma.otp.create({
      data: {
        email,
        code: otpCode,
        expiresAt: otpExpiresAt,
      },
    })

    // Send OTP email (with automatic fallback if SendGrid fails)
    console.log('Sending OTP email to:', email)
    await sendOtpEmail(email, fullName, otpCode)
    console.log('OTP process completed (check console for OTP if email failed)')

    return NextResponse.json({
      message: 'Please check your email for the verification code. Your account will be created after verification.',
      redirectTo: `/verify-otp?email=${encodeURIComponent(email)}`
    }, { status: 200 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
