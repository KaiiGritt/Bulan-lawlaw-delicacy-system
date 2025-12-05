import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/admin/messages - Get all messages (oversight)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get messages for specific conversation
      const messagesRaw = await prisma.message.findMany({
        where: { conversationId: parseInt(conversationId) },
        include: {
          sender: {
            select: { userId: true, name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Map messageId to id for frontend compatibility
      const messages = messagesRaw.map(msg => ({
        ...msg,
        id: msg.messageId,
        sender: {
          id: msg.sender.userId,
          name: msg.sender.name,
          email: msg.sender.email,
          role: msg.sender.role,
        }
      }));

      return NextResponse.json(messages);
    } else {
      // Get all conversations with latest message
      const conversationsRaw = await prisma.conversation.findMany({
        include: {
          buyer: {
            select: { userId: true, name: true, email: true }
          },
          seller: {
            select: { userId: true, name: true, email: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Map conversationId to id for frontend compatibility
      const conversations = conversationsRaw.map(conv => ({
        ...conv,
        id: conv.conversationId,
        buyer: {
          id: conv.buyer.userId,
          name: conv.buyer.name,
          email: conv.buyer.email,
        },
        seller: {
          id: conv.seller.userId,
          name: conv.seller.name,
          email: conv.seller.email,
        },
      }));

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
