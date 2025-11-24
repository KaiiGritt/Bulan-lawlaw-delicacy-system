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
    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          where: {
            product: {
              userId: session.user.id,
            },
          },
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate seller-specific totals for each order
    const ordersWithSellerTotals = orders.map(order => {
      const sellerItems = order.orderItems;
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...order,
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
