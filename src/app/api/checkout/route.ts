import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/checkout - Process checkout
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
    const { shippingAddress, billingAddress, paymentMethod } = body

    if (!shippingAddress || !billingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate total amount and check stock
    let totalAmount = 0
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        )
      }
      totalAmount += item.product.price * item.quantity
    }

    // Create order in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          shippingAddress,
          billingAddress,
          paymentMethod,
          status: 'processing'
        }
      })

      // Create order items
      const orderItems = cartItems.map((item: { productId: any; quantity: any; product: { price: any } }) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      }))

      await tx.orderItem.createMany({
        data: orderItems
      })

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: (item.product as any).stock - item.quantity }
        })
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id }
      })

      return order
    })

    return NextResponse.json({
      message: 'Order placed successfully',
      orderId: result.id,
      totalAmount
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
