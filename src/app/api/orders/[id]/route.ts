import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// GET /api/orders/[id] - Get a specific order
export async function GET(
  request: Request,
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

    const orderRaw = await prisma.order.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!orderRaw) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns this order
    if (orderRaw.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Map IDs for frontend compatibility
    const order = {
      ...orderRaw,
      id: String(orderRaw.orderId),
      orderItems: orderRaw.orderItems.map(item => ({
        ...item,
        id: item.orderItemId,
        product: {
          ...item.product,
          id: String(item.product.productId),
          user: {
            ...item.product.user,
            id: String(item.product.user.userId),
          }
        }
      }))
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
