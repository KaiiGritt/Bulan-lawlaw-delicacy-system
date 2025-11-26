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

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { sellerId: session.user.id },
          { buyerId: session.user.id }
        ]
      },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true, image: true }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(conversations)
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        sellerId: product.userId,
        buyerId: session.user.id,
        productId: productId
      }
    })

    if (existingConversation) {
      return NextResponse.json(existingConversation)
    }

    // Create new conversation and first message
    const conversation = await prisma.conversation.create({
      data: {
        sellerId: product.userId,
        buyerId: session.user.id,
        productId: productId,
        messages: {
          create: {
            senderId: session.user.id,
            content: message
          }
        }
      },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true, image: true }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true }
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
