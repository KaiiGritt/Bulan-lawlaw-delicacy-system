import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total products count
    const totalProducts = await prisma.product.count()

    // Get total orders count
    const totalOrders = await prisma.order.count()

    // Get total revenue using aggregate
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    })
    const totalRevenue = revenueResult._sum.totalAmount || 0

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: {
          select: { name: true, email: true }
        },
        orderItems: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get recent products (since there's no status field yet, show recent products)
    const pendingProducts = await prisma.product.findMany({
      take: 5,
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      pendingProducts
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
