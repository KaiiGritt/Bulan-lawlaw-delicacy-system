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
    const totalUsers = await prisma.users.count();

    // Total products
    const totalProducts = await prisma.products.count();

    // Total orders
    const totalOrders = await prisma.orders.count();

    // Total revenue
    const revenueResult = await prisma.orders.aggregate({
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Recent orders (last 5)
    const recentOrders = await prisma.orders.findMany({
      take: 5,
      include: {
        users: { select: { name: true, email: true } },
        order_items: { include: { products: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get some recently added products
    const pendingProducts = await prisma.products.findMany({
      take: 5,
      include: { users: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Pending seller applications
    const pendingSellerApplicationsRaw = await prisma.seller_applications.findMany({
      where: { status: 'pending' },
      take: 5,
      include: { users: { select: { userId: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Map applicationId to id and userId to id for frontend compatibility
    const pendingSellerApplications = pendingSellerApplicationsRaw.map(app => ({
      ...app,
      id: app.applicationId,
      users: {
        id: String(app.users.userId),
        name: app.users.name,
        email: app.users.email,
      }
    }));

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
