import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total products count
    const totalProducts = await prisma.product.count({
      where: { userId },
    });

    // Get pending products count
    const pendingProducts = await prisma.product.count({
      where: { userId, status: 'pending' },
    });

    // Get orders containing seller's products
    const sellerProducts = await prisma.product.findMany({
      where: { userId },
      select: { id: true },
    });

    const productIds = sellerProducts.map((p: { id: string }) => p.id);

    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        orderItems: {
          where: {
            productId: { in: productIds },
          },
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate total revenue from seller's products
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      const sellerItemsTotal = order.orderItems.reduce((itemSum: number, item: any) => {
        return itemSum + (item.price * item.quantity);
      }, 0);
      return sum + sellerItemsTotal;
    }, 0);

    const stats = {
      totalProducts,
      totalOrders: orders.length,
      totalRevenue,
      pendingProducts,
      recentOrders: orders.map((order: any) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: order.user,
        orderItems: order.orderItems,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
