import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { sendOrderConfirmation, sendAdminOrderNotification, sendSellerOrderNotification } from '../../lib/email'
import { Prisma } from '@prisma/client'

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
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(billingAddress),
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
          data: { stock: item.product.stock - item.quantity }
        })
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id }
      })

      return order
    })

      // Send order confirmation email to buyer
      try {
        // Ensure product includes the required 'name' property for the OrderItem type
        const orderItems = cartItems.map((item: { product: { name: string; price: any }; quantity: any }) => ({
          product: {
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity,
          price: item.product.price
        }))

        await sendOrderConfirmation(session.user.email!, {
          orderId: result.id,
          totalAmount,
          shippingAddress,
          orderItems
        })
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError)
        // Don't fail the order if email fails
      }

    // Create notification for the user
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: 'Order Placed Successfully',
          message: `Your order #${result.id.slice(-8)} has been placed and is being processed. We'll notify you when it ships.`,
          type: 'order_update'
        }
      })
    } catch (notificationError) {
      console.error('Failed to create order notification:', notificationError)
      // Don't fail the order if notification creation fails
    }

    // Send notifications to sellers and admins
    try {
      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      })

      // Send admin notifications
      for (const admin of admins) {
        try {
          await sendAdminOrderNotification(admin.email, {
            orderId: result.id,
            buyerName: session.user.name || 'Customer',
            buyerEmail: session.user.email!,
            totalAmount,
            itemCount: cartItems.length
          })
        } catch (adminEmailError) {
          console.error(`Failed to send admin notification to ${admin.email}:`, adminEmailError)
        }
      }

      // Send seller notifications and create conversations for each product
      for (const item of cartItems) {
        try {
          const seller = await prisma.user.findUnique({
            where: { id: item.product.userId },
            include: { sellerApplication: true }
          })

          if (seller && seller.email) {
            await sendSellerOrderNotification(seller.email, {
              orderId: result.id,
              buyerName: session.user.name || 'Customer',
              productName: item.product.name,
              quantity: item.quantity,
              totalAmount: item.product.price * item.quantity
            })
          }

          // Create conversation between buyer and seller for this product
          try {
            // Check if conversation already exists
            const existingConversation = await prisma.conversation.findUnique({
              where: {
                sellerId_buyerId_productId: {
                  sellerId: item.product.userId,
                  buyerId: session.user.id,
                  productId: item.productId
                }
              }
            })

            if (!existingConversation) {
              // Create new conversation
              const conversation = await prisma.conversation.create({
                data: {
                  sellerId: item.product.userId,
                  buyerId: session.user.id,
                  productId: item.productId,
                  status: 'active'
                }
              })

              // Seller sends initial message
              const businessName = seller?.sellerApplication?.businessName || seller?.name || 'Seller'
              await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  senderId: item.product.userId,
                  content: `Hello! Thank you for ordering ${item.quantity}x ${item.product.name} from ${businessName}. Your order #${result.id.slice(-8)} is now being processed. If you have any questions, feel free to ask!`
                }
              })
            } else {
              // Add message to existing conversation
              const businessName = seller?.sellerApplication?.businessName || seller?.name || 'Seller'
              await prisma.message.create({
                data: {
                  conversationId: existingConversation.id,
                  senderId: item.product.userId,
                  content: `Thank you for your new order! You've ordered ${item.quantity}x ${item.product.name} (Order #${result.id.slice(-8)}). We'll process this right away!`
                }
              })
            }
          } catch (conversationError) {
            console.error(`Failed to create conversation for product ${item.product.name}:`, conversationError)
          }
        } catch (sellerEmailError) {
          console.error(`Failed to send seller notification for product ${item.product.name}:`, sellerEmailError)
        }
      }
    } catch (notificationError) {
      console.error('Failed to send seller/admin notifications:', notificationError)
      // Don't fail the order if notifications fail
    }

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
