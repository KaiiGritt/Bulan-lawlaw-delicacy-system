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

    const ordersRaw = await prisma.orders.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                users: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map IDs for frontend compatibility
    type OrderType = typeof ordersRaw[number];
    type ItemType = OrderType['order_items'][number];
    const orders = ordersRaw.map((order: OrderType) => ({
      ...order,
      id: String(order.orderId),
      order_items: order.order_items.map((item: ItemType) => ({
        ...item,
        id: item.orderItemId,
        products: {
          ...item.products,
          id: String(item.products.productId),
          users: {
            ...item.products.users,
            id: String(item.products.users.userId),
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
