import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { sendOtpEmail } from '../../../lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const firstName = (body.firstName || '').toString().trim()
    const lastName = (body.lastName || '').toString().trim()
    const email = (body.email || '').toString().trim().toLowerCase()
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

    // Check if user already exists (case-insensitive via stored lowercased email)
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine if admin (admin accounts don't need email verification - mockup emails)
    const isAdmin = role === 'admin'

    // Create user (store lowercased email)
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: role,
        emailVerified: isAdmin // Admins are auto-verified (mockup emails)
      }
    })

    // Only send OTP for non-admin users
    if (!isAdmin) {
      // Generate and send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Delete any existing OTPs for this email
      await prisma.otp.deleteMany({
        where: { email },
      });

      // Save OTP to database
      await prisma.otp.create({
        data: {
          email,
          code: otpCode,
          expiresAt,
        },
      });

      // Send OTP email (with automatic fallback if SendGrid fails)
      console.log('Sending OTP email to:', user.email)
      await sendOtpEmail(user.email, user.name || 'User', otpCode)
      console.log('OTP process completed (check console for OTP if email failed)')
    } else {
      console.log('Admin user created - skipping OTP verification')
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: isAdmin
        ? 'Admin account created successfully. You can login directly.'
        : 'User created successfully. Please check your email for the verification code.',
      user: userWithoutPassword,
      redirectTo: isAdmin ? '/login' : `/verify-otp?email=${encodeURIComponent(email)}`
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
