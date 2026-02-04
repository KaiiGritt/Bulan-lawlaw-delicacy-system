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
    const phoneNumberRaw = (body.phoneNumber || '').toString().trim()
    const phoneNumber = phoneNumberRaw === '' ? null : phoneNumberRaw // Optional phone number, convert empty string to null
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

    try {
      // Check if user already exists (case-insensitive via stored lowercased email)
      console.log('Checking if user exists:', email)
      const existingUser = await prisma.users.findUnique({ where: { email } })

      // Check if phone number is already in use (if provided)
      if (phoneNumber) {
        const existingPhone = await prisma.users.findUnique({ where: { phoneNumber } })
        if (existingPhone) {
          return NextResponse.json({ error: 'Phone number is already registered' }, { status: 400 })
        }
      }

      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
      }
    } catch (dbError) {
      console.error('Database error during user check:', dbError)
      return NextResponse.json({ error: 'Database connection error: ' + String(dbError) }, { status: 503 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine if admin (admin accounts don't need email verification - mockup emails)
    const isAdmin = role === 'admin'

    const fullName = `${firstName} ${lastName}`

    // For admin users, create directly in the User table (no OTP needed)
    if (isAdmin) {
      const user = await prisma.users.create({
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

      const { password, ...userWithoutPassword } = user

      return NextResponse.json({
        message: 'Admin account created successfully. You can login directly.',
        user: userWithoutPassword,
        redirectTo: '/login'
      }, { status: 201 })
    }

    // For regular users, store in PendingRegistration table (NOT in User table)
    // User will only be created after OTP verification

    try {
      console.log('Step 1: Deleting existing pending registrations for email:', email)
      // Delete any existing pending registration for this email
      await prisma.pending_registrations.deleteMany({
        where: { email },
      })
      console.log('Step 1 complete')

      // Create pending registration (expires in 30 minutes)
      const pendingExpiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

      console.log('Step 2: Creating pending registration')
      await prisma.pending_registrations.create({
        data: {
          name: fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          role: role,
          expiresAt: pendingExpiresAt
        },
      })
      console.log('Step 2 complete')

      // Generate and send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      console.log('Step 3: Deleting existing OTPs')
      // Delete any existing OTPs for this email
      await prisma.otps.deleteMany({
        where: { email },
      })
      console.log('Step 3 complete')

      console.log('Step 4: Creating OTP record')
      // Save OTP to database (userId is null for pending registrations)
      await prisma.otps.create({
        data: {
          userId: null,
          email,
          code: otpCode,
          expiresAt: otpExpiresAt,
        },
      })
      console.log('Step 4 complete')

      // Send OTP email (with automatic fallback if SendGrid fails)
      console.log('Sending OTP email to:', email)
      console.log('Generated OTP code:', otpCode) // Log OTP for debugging
      try {
        await sendOtpEmail(email, fullName, otpCode)
        console.log('OTP email sent successfully')
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError)
        // Don't fail registration if email fails - OTP is saved in DB
        console.log('OTP saved in database, user can still verify with code:', otpCode)
      }

      return NextResponse.json({
        message: 'Please check your email for the verification code. Your account will be created after verification.',
        redirectTo: `/verify-otp?email=${encodeURIComponent(email)}`
      }, { status: 200 })
    } catch (dbError) {
      console.error('Database error during registration:', dbError)
      return NextResponse.json({ error: 'Database error: ' + String(dbError) }, { status: 503 })
    }
  } catch (error) {
    console.error('Registration error:', error)
    // Log more details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
