import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationsRaw = await prisma.notifications.findMany({
      where: { userId: parseInt(session.user.id) },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to 20 most recent notifications
    });

    // Map IDs for frontend compatibility
    const notifications = notificationsRaw.map((notif: typeof notificationsRaw[number]) => ({
      ...notif,
      id: notif.notificationId,
    }));

    const unreadCount = await prisma.notifications.count({
      where: {
        userId: parseInt(session.user.id),
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await req.json();

    if (notificationId) {
      // Mark specific notification as read
      await prisma.notifications.update({
        where: { notificationId: notificationId, userId: parseInt(session.user.id) },
        data: { isRead: true },
      });
    } else {
      // Mark all notifications as read
      await prisma.notifications.updateMany({
        where: { userId: parseInt(session.user.id), isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
