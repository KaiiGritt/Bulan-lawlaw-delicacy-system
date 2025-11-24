import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total users
    const totalUsers = await prisma.user.count();

    // Total products
    const totalProducts = await prisma.product.count();

    // Total orders
    const totalOrders = await prisma.order.count();

    // Total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Pending products
    const pendingProducts = await prisma.product.findMany({
      where: { status: 'pending' }, // optional if you have a status field
      take: 5,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Pending seller applications
    const pendingSellerApplications = await prisma.sellerApplication.findMany({
      where: { status: 'pending' },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      pendingProducts,
      pendingSellerApplications,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 });
  }
}
