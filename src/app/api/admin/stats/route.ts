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

    // Orders by status (for chart)
    const ordersByStatusRaw = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const ordersByStatus: Record<string, number> = {};
    ordersByStatusRaw.forEach(o => {
      ordersByStatus[o.status] = o._count.id;
    });

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
      where: { status: 'pending' }, // assumes you have a status field
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

    // Revenue trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueTrendRaw = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      _sum: { totalAmount: true },
    });

    const revenueTrend: Record<string, number> = {};
    last7Days.forEach(date => {
      const match = revenueTrendRaw.find(r => r.createdAt.toISOString().split('T')[0] === date);
      revenueTrend[date] = match?._sum.totalAmount || 0;
    });

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders,
      pendingProducts,
      pendingSellerApplications,
      revenueTrend,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 });
  }
}
