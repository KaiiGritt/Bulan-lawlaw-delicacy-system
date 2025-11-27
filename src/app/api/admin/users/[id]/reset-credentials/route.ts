import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Find user
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate reset token and expiry (e.g., 1 hour expiry)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000) // 1 hour from now

    // Update user with reset token and expiry
    await prisma.user.update({
      where: { id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Note: Sending email with reset link can be done separately

    return NextResponse.json({
      message: 'Reset token generated successfully',
      resetToken, // for admin use or testing
    })
  } catch (error) {
    console.error('Error generating reset token:', error)
    return NextResponse.json(
      { error: 'Failed to generate reset token' },
      { status: 500 }
    )
  }
}
