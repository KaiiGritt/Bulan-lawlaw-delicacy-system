import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { sendOrderTrackingEmail } from '../../../../lib/notifications'

// GET /api/orders/[id]/tracking - Get order tracking information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        trackingHistory: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
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
    if (session.user.role !== 'admin' && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      trackingHistory: order.trackingHistory
    })
  } catch (error) {
    console.error('Error fetching tracking info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    )
  }
}

// POST /api/orders/[id]/tracking - Add tracking update (Seller/Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { status, location, description } = body

    if (!status || !description) {
      return NextResponse.json(
        { error: 'Status and description are required' },
        { status: 400 }
      )
    }

    // Add tracking history entry
    const trackingEntry = await prisma.orderTrackingHistory.create({
      data: {
        orderId: params.id,
        status,
        location,
        description
      }
    })

    // Update order status and get user info
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Send email notification
    try {
      await sendOrderTrackingEmail({
        customerEmail: order.user.email,
        customerName: order.user.name || 'Customer',
        orderId: order.id,
        status,
        trackingNumber: order.trackingNumber || undefined,
        courier: order.courier || undefined,
        estimatedDeliveryDate: order.estimatedDeliveryDate?.toISOString(),
        description
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(trackingEntry, { status: 201 })
  } catch (error) {
    console.error('Error adding tracking update:', error)
    return NextResponse.json(
      { error: 'Failed to add tracking update' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id]/tracking - Update tracking info (Seller/Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { trackingNumber, courier, estimatedDeliveryDate, status } = body

    const updateData: any = {}
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (courier !== undefined) updateData.courier = courier
    if (estimatedDeliveryDate !== undefined) updateData.estimatedDeliveryDate = new Date(estimatedDeliveryDate)
    if (status !== undefined) {
      updateData.status = status

      // Auto-set shipped/delivered dates based on status
      if (status === 'shipped' && !updateData.shippedAt) {
        updateData.shippedAt = new Date()
      }
      if (status === 'delivered' && !updateData.deliveredAt) {
        updateData.deliveredAt = new Date()
      }
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        trackingHistory: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Create tracking history entry for status changes
    if (status) {
      await prisma.orderTrackingHistory.create({
        data: {
          orderId: params.id,
          status,
          description: `Order status updated to ${status}`,
          location: null
        }
      })

      // Send email notification
      try {
        await sendOrderTrackingEmail({
          customerEmail: order.user.email,
          customerName: order.user.name || 'Customer',
          orderId: order.id,
          status,
          trackingNumber: order.trackingNumber || undefined,
          courier: order.courier || undefined,
          estimatedDeliveryDate: order.estimatedDeliveryDate?.toISOString(),
          description: `Order status updated to ${status}`
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating tracking info:', error)
    return NextResponse.json(
      { error: 'Failed to update tracking information' },
      { status: 500 }
    )
  }
}
