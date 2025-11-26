import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '../../../lib/email'

// In a real application, you would:
// 1. Generate a secure reset token
// 2. Store it in the database with expiration
// 3. Send an email with the reset link
// 4. Create a reset password page that validates the token

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent you a password reset link.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token and expiry in user record
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    })

    // In a real app, you'd create a password reset token table
    // For now, we'll just simulate the process
    console.log(`Password reset requested for: ${email}`)
    console.log(`Reset token: ${resetToken}`)
    console.log(`Token expires: ${resetTokenExpiry}`)

    // Send password reset email
    try {
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
      await sendPasswordResetEmail(email, resetUrl)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent you a password reset link.'
    })
  } catch (error) {
    console.error('Error processing forgot password:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
