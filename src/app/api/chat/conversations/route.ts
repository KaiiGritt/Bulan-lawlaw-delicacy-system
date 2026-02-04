import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// GET /api/chat/conversations - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversations.findMany({
      where: {
        OR: [
          { sellerId: parseInt(session.user.id) },
          { buyerId: parseInt(session.user.id) }
        ]
      },
      include: {
        users_conversations_sellerIdTousers: {
          select: {
            userId: true,
            name: true,
            email: true,
            seller_applications: {
              select: {
                businessName: true,
                businessLogo: true
              }
            }
          }
        },
        users_conversations_buyerIdTousers: {
          select: { userId: true, name: true, email: true }
        },
        products: {
          select: { productId: true, name: true, image: true }
        },
        messages: {
          include: {
            users: {
              select: { userId: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Map IDs for frontend compatibility
    const mappedConversations = conversations.map(conv => ({
      ...conv,
      id: conv.conversationId,
      seller: {
        ...conv.users_conversations_sellerIdTousers,
        id: String(conv.users_conversations_sellerIdTousers.userId),
      },
      buyer: {
        ...conv.users_conversations_buyerIdTousers,
        id: String(conv.users_conversations_buyerIdTousers.userId),
      },
      product: conv.products ? {
        ...conv.products,
        id: String(conv.products.productId),
      } : null,
      messages: conv.messages.map(msg => ({
        ...msg,
        id: msg.messageId,
        sender: {
          ...msg.users,
          id: String(msg.users.userId),
        }
      }))
    }));

    return NextResponse.json(mappedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId, message } = await request.json()

    if (!productId || !message) {
      return NextResponse.json(
        { error: 'Product ID and message are required' },
        { status: 400 }
      )
    }

    // Get the product to find the seller
    const product = await prisma.products.findUnique({
      where: { productId: productId },
      select: { userId: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversations.findFirst({
      where: {
        sellerId: product.userId,
        buyerId: parseInt(session.user.id),
        productId: productId
      }
    })

    if (existingConversation) {
      return NextResponse.json(existingConversation)
    }

    // Create new conversation and first message
    const conversation = await prisma.conversations.create({
      data: {
        sellerId: product.userId,
        buyerId: parseInt(session.user.id),
        productId: productId,
        messages: {
          create: {
            senderId: parseInt(session.user.id),
            content: message
          }
        }
      },
      include: {
        users_conversations_sellerIdTousers: {
          select: {
            userId: true,
            name: true,
            email: true,
            seller_applications: {
              select: {
                businessName: true,
                businessLogo: true
              }
            }
          }
        },
        users_conversations_buyerIdTousers: {
          select: { userId: true, name: true, email: true }
        },
        products: {
          select: { productId: true, name: true, image: true }
        },
        messages: {
          include: {
            users: {
              select: { userId: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
