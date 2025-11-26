import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let dateFilter;
    if (period === 'daily') {
      dateFilter = { gte: today };
    } else if (period === 'weekly') {
      dateFilter = { gte: startOfWeek };
    } else {
      dateFilter = { gte: startOfMonth };
    }

    // Sales Performance
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        status: { not: 'cancelled' }
      },
      include: {
        orderItems: true
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sales by date
    const salesByDate: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + order.totalAmount;
    });

    // Top Selling Products
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number; productId: string } } = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });

        if (product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        }
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top Sellers
    const sellerSales: { [key: string]: { name: string; revenue: number; orders: number; sellerId: string } } = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { user: true }
        });

        if (product && product.user) {
          if (!sellerSales[product.userId]) {
            sellerSales[product.userId] = {
              sellerId: product.userId,
              name: product.user.name || 'Unknown',
              revenue: 0,
              orders: 0
            };
          }
          sellerSales[product.userId].revenue += item.price * item.quantity;
        }
      }
    }

    // Count orders per seller
    for (const sellerId in sellerSales) {
      const sellerOrders = orders.filter(order =>
        order.orderItems.some(item => {
          const product = productSales[item.productId];
          return product !== undefined;
        })
      );
      sellerSales[sellerId].orders = sellerOrders.length;
    }

    const topSellers = Object.values(sellerSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // User Growth Trends
    const usersByDate: { [key: string]: number } = {};
    const users = await prisma.user.findMany({
      where: {
        createdAt: dateFilter
      },
      select: {
        createdAt: true,
        role: true
      }
    });

    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    const totalUsers = await prisma.user.count();
    const newUsers = users.length;
    const buyersCount = users.filter(u => u.role === 'buyer').length;
    const sellersCount = users.filter(u => u.role === 'seller').length;

    // Abandoned Cart Statistics
    const allCartItems = await prisma.cartItem.findMany({
      where: {
        updatedAt: dateFilter
      },
      include: {
        product: true,
        user: true
      }
    });

    // Group cart items by user to get unique carts
    const cartsByUser: { [userId: string]: typeof allCartItems } = {};
    allCartItems.forEach(item => {
      if (!cartsByUser[item.userId]) {
        cartsByUser[item.userId] = [];
      }
      cartsByUser[item.userId].push(item);
    });

    const totalCarts = Object.keys(cartsByUser).length;
    const cartsWithItems = Object.values(cartsByUser).filter(items => items.length > 0).length;

    // Calculate potential revenue from abandoned carts
    const abandonedCartValue = Object.values(cartsByUser).reduce((sum, items) => {
      const cartValue = items.reduce((itemSum, item) =>
        itemSum + (item.product.price * item.quantity), 0
      );
      return sum + cartValue;
    }, 0);

    // Conversion Rates
    const totalVisitors = await prisma.user.count(); // Simplified - in real scenario, track actual visits
    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;
    const cartConversionRate = cartsWithItems > 0 ? ((totalOrders / cartsWithItems) * 100) : 0;

    // Product Categories Performance
    const categoryPerformance: { [key: string]: { revenue: number; orders: number } } = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { category: true }
        });

        if (product) {
          const category = product.category;
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = { revenue: 0, orders: 0 };
          }
          categoryPerformance[category].revenue += item.price * item.quantity;
          categoryPerformance[category].orders += 1;
        }
      }
    }

    // Order Status Distribution
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: dateFilter
      },
      _count: true
    });

    const statusDistribution = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as { [key: string]: number });

    return NextResponse.json({
      period,
      dateRange: {
        start: dateFilter.gte.toISOString(),
        end: now.toISOString()
      },
      sales: {
        total: totalSales,
        orders: totalOrders,
        averageOrderValue,
        byDate: Object.entries(salesByDate).map(([date, amount]) => ({
          date,
          amount
        })).sort((a, b) => a.date.localeCompare(b.date))
      },
      products: {
        topSelling: topProducts
      },
      sellers: {
        topPerformers: topSellers
      },
      users: {
        total: totalUsers,
        new: newUsers,
        buyers: buyersCount,
        sellers: sellersCount,
        growthByDate: Object.entries(usersByDate).map(([date, count]) => ({
          date,
          count
        })).sort((a, b) => a.date.localeCompare(b.date))
      },
      carts: {
        total: totalCarts,
        withItems: cartsWithItems,
        abandoned: cartsWithItems - totalOrders,
        abandonedValue: abandonedCartValue,
        abandonedRate: cartsWithItems > 0 ? ((cartsWithItems - totalOrders) / cartsWithItems * 100) : 0
      },
      conversion: {
        overallRate: conversionRate,
        cartConversionRate: cartConversionRate
      },
      categories: Object.entries(categoryPerformance).map(([category, data]) => ({
        category,
        revenue: data.revenue,
        orders: data.orders
      })).sort((a, b) => b.revenue - a.revenue),
      orderStatus: statusDistribution
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
