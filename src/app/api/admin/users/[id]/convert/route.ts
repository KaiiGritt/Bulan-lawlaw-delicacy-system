import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'

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
    const user = await prisma.user.findUnique({ where: { userId: parseInt(id) } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Toggle role between 'user' and 'seller'
    let newRole: string
    let sellerApplicationData: {
      create?: {
        businessName: string
        businessType: string
        description: string
        contactNumber: string
        address: string
        status: string
      }
    } = {}

    if (user.role === 'user') {
      newRole = 'seller'
      // Create a blank SellerApplication for the user if not exists
      const existingApp = await prisma.sellerApplication.findUnique({
        where: { userId: parseInt(id) },
      })
      if (!existingApp) {
        sellerApplicationData = {
          create: {
            businessName: 'Admin Approved',
            businessType: 'General',
            description: 'Converted by admin',
            contactNumber: '',
            address: '',
            status: 'approved',
          },
        }
      } else {
        // If exists, update status to approved
        await prisma.sellerApplication.update({
          where: { userId: parseInt(id) },
          data: { status: 'approved' }
        })
      }
    } else if (user.role === 'seller') {
      newRole = 'user'
      // Delete seller application if any
      await prisma.sellerApplication.deleteMany({ where: { userId: parseInt(id) } })
    } else {
      return NextResponse.json(
        { error: 'Cannot convert admin role' },
        { status: 400 }
      )
    }

    // Update user role and create seller application if needed
    const updatedUser = await prisma.user.update({
      where: { userId: parseInt(id) },
      data: {
        role: newRole,
        sellerApplication: sellerApplicationData,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error converting user role:', error)
    return NextResponse.json(
      { error: 'Failed to convert user role' },
      { status: 500 }
    )
  }
}
