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

    const userId = parseInt(session.user.id);

    // Get total products count
    const totalProducts = await prisma.products.count({
      where: { userId },
    });

    // Get pending products count (all products owned by seller)
    const pendingProducts = 0;

    // Get orders containing seller's products
    const sellerProducts = await prisma.products.findMany({
      where: { userId },
      select: { productId: true },
    });

    const productIds = sellerProducts.map((p: { productId: number }) => p.productId);

    const orders = await prisma.orders.findMany({
      where: {
        order_items: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        users: {
          select: { name: true, email: true },
        },
        order_items: {
          where: {
            productId: { in: productIds },
          },
          include: {
            products: {
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
      const sellerItemsTotal = order.order_items.reduce((itemSum: number, item: any) => {
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
        id: String(order.orderId),
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: order.users,
        order_items: order.order_items,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
