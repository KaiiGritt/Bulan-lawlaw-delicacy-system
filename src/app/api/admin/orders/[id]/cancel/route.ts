import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(
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

    const { id } = await params
    const { reason } = await request.json()

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Get the order
    const order = await prisma.orders.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
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

    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      )
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel order that has been shipped or delivered' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.orders.update({
      where: { orderId: parseInt(id) },
      data: {
        status: 'cancelled',
        adminApprovalRequired: false,
        cancellationReason: reason.trim(),
        cancelledAt: new Date(),
        
      }
    })

    // Restore product stock
    for (const item of order.order_items) {
      await prisma.products.update({
        where: { productId: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    }

    // Create notification for the user
    await prisma.notifications.create({
      data: {
        userId: order.userId,
        title: 'Order Cancelled by Admin',
        message: `Your order #${id} has been cancelled by an administrator. Reason: ${reason.trim()}`,
        type: 'order_update'
      }
    })

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}
