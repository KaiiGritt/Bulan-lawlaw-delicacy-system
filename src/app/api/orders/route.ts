import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

// GET /api/orders - Get user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ordersRaw = await prisma.order.findMany({
      where: { userId: parseInt(session.user.id) },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map IDs for frontend compatibility
    const orders = ordersRaw.map(order => ({
      ...order,
      id: String(order.orderId),
      orderItems: order.orderItems.map(item => ({
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
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
