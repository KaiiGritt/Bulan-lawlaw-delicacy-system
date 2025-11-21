import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendEmailVerification } from '../../../lib/email'
import crypto from 'crypto'

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

    // Check if token is still valid (not expired)
    if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry > new Date()) {
      // Token still valid, resend the same token
      try {
        await sendEmailVerification(user.email, user.name || 'User', user.emailVerificationToken!)
        return NextResponse.json({ message: 'Verification email sent successfully' })
      } catch (emailError) {
        console.error('Failed to resend verification email:', emailError)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }
    }

    // Generate new token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationTokenExpiry
      }
    })

    // Send new verification email
    try {
      await sendEmailVerification(user.email, user.name || 'User', emailVerificationToken)
      return NextResponse.json({ message: 'Verification email sent successfully' })
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
