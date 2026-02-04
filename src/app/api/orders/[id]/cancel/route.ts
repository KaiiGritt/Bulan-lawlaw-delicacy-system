import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function POST(
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

    if (order.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this order' },
        { status: 403 }
      )
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled at this stage' },
        { status: 400 }
      )
    }

    // Determine if admin approval is required
    // Require approval if order is in processing stage
    const requiresApproval = order.status === 'processing'

    const updatedOrder = await prisma.orders.update({
      where: { orderId: parseInt(id) },
      data: {
        status: requiresApproval ? 'processing' : 'cancelled',
        adminApprovalRequired: requiresApproval,
        cancellationReason: reason.trim(),
        cancelledAt: requiresApproval ? undefined : new Date(),
        
      }
    })

    // Create notification for the user
    await prisma.notifications.create({
      data: {
        userId: parseInt(session.user.id),
        title: requiresApproval ? 'Cancellation Request Submitted' : 'Order Cancelled',
        message: requiresApproval
          ? `Your cancellation request for order #${id} has been submitted and is pending admin approval.`
          : `Your order #${id} has been cancelled.`,
        type: 'order_update'
      }
    })

    // If admin approval is required, notify admins
    if (requiresApproval) {
      const admins = await prisma.users.findMany({
        where: { role: 'admin' }
      })

      for (const admin of admins) {
        await prisma.notifications.create({
          data: {
            userId: admin.userId,
            title: 'Order Cancellation Request',
            message: `User ${session.user.name || session.user.email} has requested to cancel order #${id}. Reason: ${reason.trim()}`,
            type: 'admin_action_required'
          }
        })
      }
    } else {
      // If no approval required, restore product stock
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
    }

    return NextResponse.json({
      message: requiresApproval ? 'Cancellation request submitted' : 'Order cancelled successfully',
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
