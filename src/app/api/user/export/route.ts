import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// GET /api/user/export - Export user data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all user data
    const user = await prisma.users.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: {
        orders: {
          include: {
            order_items: {
              include: {
                products: true
              }
            }
          }
        },
        cart_items: {
          include: {
            products: true
          }
        },
        products: true,
        seller_applications: true,
        messages: true,
        notifications: true,
        comments: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data
    const { password, resetToken, resetTokenExpiry, ...userData } = user

    // Create JSON export
    const exportData = {
      exportDate: new Date().toISOString(),
      userData,
      notice: 'This is your personal data export from Lawlaw Delights. Please keep this file secure.'
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lawlaw-delights-data-${session.user.id}-${Date.now()}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
