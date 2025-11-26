import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // confirm prisma import path
import { getServerSession } from 'next-auth'; // depends on auth setup
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const messageId = (await context.params).id;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            seller: true,
            buyer: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const userId = session.user.id;

    // Check if user is sender of message or seller in conversation
    if (message.senderId !== userId && message.conversation.seller.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.message.delete({ where: { id: messageId } });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Error deleting message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
