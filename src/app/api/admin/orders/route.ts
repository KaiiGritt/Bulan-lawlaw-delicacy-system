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

    const ordersRaw = await prisma.order.findMany({
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
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
      user: {
        id: String(order.user.userId),
        name: order.user.name,
        email: order.user.email,
      },
      orderItems: order.orderItems.map(item => ({
        ...item,
        id: item.orderItemId,
        product: {
          id: String(item.product.productId),
          name: item.product.name,
          image: item.product.image,
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
