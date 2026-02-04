import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    // Get orders that contain the seller's products
    const orders = await prisma.orders.findMany({
      where: {
        order_items: {
          some: {
            products: {
              userId: parseInt(session.user.id),
            },
          },
        },
      },
      include: {
        users: {
          select: { userId: true, name: true, email: true },
        },
        order_items: {
          where: {
            products: {
              userId: parseInt(session.user.id),
            },
          },
          include: {
            products: {
              select: { productId: true, name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate seller-specific totals for each order and map IDs
    const ordersWithSellerTotals = orders.map((order: any) => {
      const sellerItems = order.order_items.map((item: any) => ({
        ...item,
        id: item.orderItemId,
        products: {
          ...item.products,
          id: String(item.products.productId),
        }
      }));
      const sellerTotal = sellerItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);

      return {
        ...order,
        id: String(order.orderId),
        users: {
          ...order.users,
          id: String(order.users.userId),
        },
        order_items: sellerItems,
        sellerItems,
        sellerTotal,
      };
    });

    return NextResponse.json(ordersWithSellerTotals);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
