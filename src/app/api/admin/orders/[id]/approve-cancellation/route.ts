import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

// PATCH /api/admin/orders/[id]/approve-cancellation - Approve or reject order cancellation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { approved } = await request.json()

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid approval status' },
        { status: 400 }
      )
    }

    const { id } = await params

    const order = await prisma.orders.findUnique({
      where: { orderId: parseInt(id) }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (!order.adminApprovalRequired) {
      return NextResponse.json(
        { error: 'Order does not require admin approval' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.orders.update({
      where: { orderId: parseInt(id) },
      data: {
        status: approved ? 'cancelled' : 'processing',
        adminApprovalRequired: false
      },
      include: {
        users: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        },
        order_items: {
          include: {
            products: true
          }
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order cancellation:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
