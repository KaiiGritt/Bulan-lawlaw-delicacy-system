import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { sendOrderStatusEmail } from '../../../../lib/notifications'

// GET /api/orders/[id]/tracking - Get order status information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const order = await prisma.orders.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        order_tracking_history: {
          orderBy: { createdAt: 'desc' }
        },
        users: {
          select: {
            userId: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this order
    if (session.user.role !== 'admin' && order.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      orderId: order.orderId,
      status: order.status,
      order_tracking_history: order.order_tracking_history
    })
  } catch (error) {
    console.error('Error fetching tracking info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    )
  }
}

// Helper function to get status label
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Order Placed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

// POST /api/orders/[id]/tracking - Update order status (Seller/Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['admin', 'seller'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, description } = body

    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, preparing, ready, or cancelled' },
        { status: 400 }
      )
    }

    const { id } = await params

    // Add status history entry
    const trackingEntry = await prisma.order_tracking_history.create({
      data: {
        orderId: parseInt(id),
        status,
        description: description || `Order status updated to ${getStatusLabel(status)}`
      }
    })

    // Update order status and get user info
    const order = await prisma.orders.update({
      where: { orderId: parseInt(id) },
      data: { status },
      include: {
        users: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Send email notification
    try {
      await sendOrderStatusEmail({
        customerEmail: order.users.email,
        customerName: order.users.name || 'Customer',
        orderId: String(order.orderId),
        status,
        description: description || `Order status updated to ${getStatusLabel(status)}`
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(trackingEntry, { status: 201 })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
