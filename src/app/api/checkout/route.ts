import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { sendOrderConfirmation, sendAdminOrderNotification, sendSellerOrderNotification } from '../../lib/email'

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
      where: { userId: parseInt(session.user.id) },
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

    // Create order without transaction for faster processing on slow DB connections
    // Step 1: Create the order
    const order = await prisma.order.create({
      data: {
        userId: parseInt(session.user.id),
        totalAmount,
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(billingAddress),
        paymentMethod,
        status: 'processing'
      }
    })

    // Step 2: Create order items
    const orderItemsData = cartItems.map((item: { productId: any; quantity: any; product: { price: any } }) => ({
      orderId: order.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price
    }))

    await prisma.orderItem.createMany({
      data: orderItemsData
    })

    // Step 3: Update product stock in parallel
    await Promise.all(
      cartItems.map((item) =>
        prisma.product.update({
          where: { productId: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    )

    // Step 4: Clear the cart
    await prisma.cartItem.deleteMany({
      where: { userId: parseInt(session.user.id) }
    })

    const result = order

    // Run all notifications and emails in the background (don't await)
    // This makes the checkout response much faster
    const backgroundTasks = async () => {
      // Send order confirmation email to buyer
      try {
        const orderItems = cartItems.map((item: { product: { name: string; price: any }; quantity: any }) => ({
          product: { name: item.product.name, price: item.product.price },
          quantity: item.quantity,
          price: item.product.price
        }))
        await sendOrderConfirmation(session.user.email!, {
          orderId: String(result.orderId),
          totalAmount,
          shippingAddress,
          orderItems
        })
      } catch (e) {
        console.error('Failed to send order confirmation email:', e)
      }

      // Create notification for the user
      try {
        await prisma.notification.create({
          data: {
            userId: parseInt(session.user.id),
            title: 'Order Placed Successfully',
            message: `Your order #${result.orderId} has been placed and is being processed.`,
            type: 'order_update'
          }
        })
      } catch (e) {
        console.error('Failed to create order notification:', e)
      }

      // Send admin notifications
      try {
        const admins = await prisma.user.findMany({ where: { role: 'admin' } })
        for (const admin of admins) {
          sendAdminOrderNotification(admin.email, {
            orderId: String(result.orderId),
            buyerName: session.user.name || 'Customer',
            buyerEmail: session.user.email!,
            totalAmount,
            itemCount: cartItems.length
          }).catch(e => console.error(`Admin notification error:`, e))
        }
      } catch (e) {
        console.error('Failed to fetch admins:', e)
      }

      // Send seller notifications and create conversations
      for (const item of cartItems) {
        try {
          const seller = await prisma.user.findUnique({
            where: { userId: item.product.userId },
            include: { sellerApplication: true }
          })

          if (seller?.email) {
            sendSellerOrderNotification(seller.email, {
              orderId: String(result.orderId),
              buyerName: session.user.name || 'Customer',
              productName: item.product.name,
              quantity: item.quantity,
              totalAmount: item.product.price * item.quantity
            }).catch(e => console.error(`Seller notification error:`, e))
          }

          // Create or update conversation
          const existingConversation = await prisma.conversation.findUnique({
            where: {
              sellerId_buyerId_productId: {
                sellerId: item.product.userId,
                buyerId: parseInt(session.user.id),
                productId: item.productId
              }
            }
          })

          const businessName = seller?.sellerApplication?.businessName || seller?.name || 'Seller'

          if (!existingConversation) {
            const conversation = await prisma.conversation.create({
              data: {
                sellerId: item.product.userId,
                buyerId: parseInt(session.user.id),
                productId: item.productId,
                status: 'active'
              }
            })
            await prisma.message.create({
              data: {
                conversationId: conversation.conversationId,
                senderId: item.product.userId,
                content: `Hello! Thank you for ordering ${item.quantity}x ${item.product.name} from ${businessName}. Your order #${result.orderId} is now being processed.`
              }
            })
          } else {
            await prisma.message.create({
              data: {
                conversationId: existingConversation.conversationId,
                senderId: item.product.userId,
                content: `Thank you for your new order! You've ordered ${item.quantity}x ${item.product.name} (Order #${result.orderId}).`
              }
            })
          }
        } catch (e) {
          console.error(`Seller/conversation error for ${item.product.name}:`, e)
        }
      }
    }

    // Fire and forget - don't wait for background tasks
    backgroundTasks().catch(e => console.error('Background tasks error:', e))

    // Return immediately after order is created
    return NextResponse.json({
      message: 'Order placed successfully',
      orderId: result.orderId,
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
