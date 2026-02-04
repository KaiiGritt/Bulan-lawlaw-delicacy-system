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
      const messagesRaw = await prisma.messages.findMany({
        where: { conversationId: parseInt(conversationId) },
        include: {
          users: {
            select: { userId: true, name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Map messageId to id for frontend compatibility
      const messages = messagesRaw.map((msg: typeof messagesRaw[number]) => ({
        ...msg,
        id: msg.messageId,
        sender: {
          id: msg.users.userId,
          name: msg.users.name,
          email: msg.users.email,
          role: msg.users.role,
        }
      }));

      return NextResponse.json(messages);
    } else {
      // Get all conversations with latest message
      const conversationsRaw = await prisma.conversations.findMany({
        include: {
          users_conversations_buyerIdTousers: {
            select: { userId: true, name: true, email: true }
          },
          users_conversations_sellerIdTousers: {
            select: { userId: true, name: true, email: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              users: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Map conversationId to id for frontend compatibility
      const conversations = conversationsRaw.map((conv: typeof conversationsRaw[number]) => ({
        ...conv,
        id: conv.conversationId,
        buyer: {
          id: conv.users_conversations_buyerIdTousers.userId,
          name: conv.users_conversations_buyerIdTousers.name,
          email: conv.users_conversations_buyerIdTousers.email,
        },
        seller: {
          id: conv.users_conversations_sellerIdTousers.userId,
          name: conv.users_conversations_sellerIdTousers.name,
          email: conv.users_conversations_sellerIdTousers.email,
        },
      }));

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
