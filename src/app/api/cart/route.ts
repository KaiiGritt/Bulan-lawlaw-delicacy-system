import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

// GET /api/cart - Get user's cart items
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cartItemsRaw = await prisma.cart_items.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        products: true
      }
    })

    // Map IDs for frontend compatibility
    const cartItems = cartItemsRaw.map((item: typeof cartItemsRaw[number]) => ({
      ...item,
      id: item.cartItemId,
      products: {
        ...item.products,
        id: String(item.products.productId),
      }
    }))

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId: productIdRaw, quantity = 1 } = body

    if (!productIdRaw) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Parse productId to integer (frontend may send it as string)
    const productId = parseInt(String(productIdRaw), 10)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Check if product exists and has stock
    const product = await prisma.products.findUnique({
      where: { productId: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Prevent sellers from buying their own products
    if (product.userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'You cannot purchase your own product' },
        { status: 400 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_items.findUnique({
      where: {
        userId_productId: {
          userId: parseInt(session.user.id),
          productId
        }
      }
    })

    let cartItem
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cart_items.update({
        where: { cartItemId: existingItem.cartItemId },
        data: { quantity: existingItem.quantity + quantity },
        include: { products: true }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cart_items.create({
        data: {
          userId: parseInt(session.user.id),
          productId,
          quantity,
          
        },
        include: { products: true }
      })
    }

    // Map IDs for frontend compatibility
    const mappedCartItem = {
      ...cartItem,
      id: cartItem.cartItemId,
      products: {
        ...cartItem.products,
        id: String(cartItem.products.productId),
      }
    }

    return NextResponse.json(mappedCartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.cart_items.deleteMany({
      where: { userId: parseInt(session.user.id) }
    })

    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
