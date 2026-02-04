import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// PATCH /api/seller/orders/[id] - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Unauthorized. Seller access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Check if the order exists and if it contains the seller's products
    const order = await prisma.orders.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        order_items: {
          include: {
            products: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the seller owns at least one product in the order
    const sellerOwnsProduct = order.order_items.some(
      (item: typeof order.order_items[number]) => item.products.userId === parseInt(session.user.id)
    );

    if (!sellerOwnsProduct) {
      return NextResponse.json(
        { error: 'You do not have permission to update this order' },
        { status: 403 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.orders.update({
      where: { orderId: parseInt(id) },
      data: { status },
      include: {
        users: {
          select: { userId: true, name: true, email: true }
        },
        order_items: {
          include: {
            products: {
              select: { productId: true, name: true, price: true }
            }
          }
        }
      }
    });

    // Map IDs for frontend compatibility
    const mappedOrder = {
      ...updatedOrder,
      id: String(updatedOrder.orderId),
      users: {
        ...updatedOrder.users,
        id: String(updatedOrder.users.userId),
      },
      order_items: updatedOrder.order_items.map((item: typeof updatedOrder.order_items[number]) => ({
        ...item,
        id: item.orderItemId,
        products: {
          ...item.products,
          id: String(item.products.productId),
        }
      }))
    };

    return NextResponse.json(mappedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

// GET /api/seller/orders/[id] - Get specific order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Unauthorized. Seller access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await prisma.orders.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        users: {
          select: { userId: true, name: true, email: true }
        },
        order_items: {
          where: {
            products: {
              userId: parseInt(session.user.id)
            }
          },
          include: {
            products: {
              select: { productId: true, name: true, price: true, image: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the seller owns at least one product in the order
    if (order.order_items.length === 0) {
      return NextResponse.json(
        { error: 'You do not have permission to view this order' },
        { status: 403 }
      );
    }

    // Calculate seller-specific total
    const sellerTotal = order.order_items.reduce(
      (sum: number, item: typeof order.order_items[number]) => sum + (item.price * item.quantity),
      0
    );

    // Map IDs for frontend compatibility
    const mappedOrder = {
      ...order,
      id: String(order.orderId),
      users: {
        ...order.users,
        id: String(order.users.userId),
      },
      order_items: order.order_items.map((item: typeof order.order_items[number]) => ({
        ...item,
        id: item.orderItemId,
        products: {
          ...item.products,
          id: String(item.products.productId),
        }
      })),
      sellerTotal
    };

    return NextResponse.json(mappedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
