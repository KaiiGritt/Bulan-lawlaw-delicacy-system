import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { sendEmailVerification } from '../../../lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const firstName = (body.firstName || '').toString().trim()
    const lastName = (body.lastName || '').toString().trim()
    const email = (body.email || '').toString().trim().toLowerCase()
    const password = (body.password || '').toString()

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

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user (store lowercased email)
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: 'user',
        emailVerificationToken,
        emailVerificationTokenExpiry
      }
    })

    // Send email verification email (best-effort)
    try {
      console.log('Attempting to send verification email to:', user.email)
      if (user.email && user.name) {
        await sendEmailVerification(user.email, user.name, emailVerificationToken)
        console.log('Verification email sent successfully')
      } else {
        console.log('Missing email or name for verification email')
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ message: 'User created successfully. Please check your email to verify your account.', user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
