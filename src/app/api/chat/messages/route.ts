import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import Pusher from 'pusher';

// Initialize Pusher only if credentials are available
let pusher: Pusher | null = null;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });
}

// GET /api/chat/messages?conversationId=xxx - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Check if user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { conversationId: parseInt(conversationId) },
      select: { sellerId: true, buyerId: true }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.sellerId !== parseInt(session.user.id) && conversation.buyerId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to access this conversation' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(conversationId) },
      include: {
        sender: {
          select: { userId: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        senderId: { not: parseInt(session.user.id) },
        isRead: false
      },
      data: { isRead: true }
    })

    // Map IDs for frontend compatibility
    const mappedMessages = messages.map(msg => ({
      ...msg,
      id: msg.messageId,
      sender: {
        ...msg.sender,
        id: String(msg.sender.userId),
      }
    }));

    return NextResponse.json(mappedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      )
    }

    // Check if user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { conversationId: conversationId },
      select: { sellerId: true, buyerId: true }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.sellerId !== parseInt(session.user.id) && conversation.buyerId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to send messages in this conversation' },
        { status: 403 }
      )
    }

    // Create the message and update conversation timestamp
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: parseInt(session.user.id),
        content
      },
      include: {
        sender: {
          select: { userId: true, name: true, email: true }
        }
      }
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { conversationId: conversationId },
      data: { updatedAt: new Date() }
    })

    // Trigger Pusher event to notify sender and receiver (only if Pusher is configured)
    if (pusher) {
      const senderChannel = `user-${session.user.id}`
      const receiverId = conversation.sellerId === parseInt(session.user.id) ? conversation.buyerId : conversation.sellerId
      const receiverChannel = `user-${receiverId}`

      const eventPayload = {
        message: {
          id: message.messageId,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender
        },
        conversationId
      }

      try {
        // Trigger event for sender
        await pusher.trigger(senderChannel, 'new-message', eventPayload)

        // Trigger event for receiver
        await pusher.trigger(receiverChannel, 'new-message', eventPayload)
      } catch (pusherError) {
        console.error('Error triggering Pusher event:', pusherError)
        // Don't fail the request if Pusher fails - message is already saved
      }
    }

    // Map IDs for frontend compatibility
    const mappedMessage = {
      ...message,
      id: message.messageId,
      sender: {
        ...message.sender,
        id: String(message.sender.userId),
      }
    };

    return NextResponse.json(mappedMessage, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
