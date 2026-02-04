import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ordersRaw = await prisma.orders.findMany({
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
            products: {
              select: {
                productId: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Map to expected format with 'id' fields for frontend compatibility
    const orders = ordersRaw.map(order => ({
      ...order,
      id: String(order.orderId),
      users: {
        id: String(order.users.userId),
        name: order.users.name,
        email: order.users.email,
      },
      order_items: order.order_items.map(item => ({
        ...item,
        id: item.orderItemId,
        products: {
          id: String(item.products.productId),
          name: item.products.name,
          image: item.products.image,
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
