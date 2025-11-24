import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderItem {
  product: {
    name: string
  }
  quantity: number
  price: number
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: `"Lawlaw Delights" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    }

    await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully to ${options.to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    console.error('GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set')
    console.error('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set')
    throw new Error('Failed to send email')
  }
}

export async function sendRegistrationConfirmation(email: string, name: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Lawlaw Delights!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #D2691E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Lawlaw Delights!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for joining Lawlaw Delights! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our delicious Filipino products</li>
            <li>Discover authentic recipes</li>
            <li>Place orders for delivery</li>
            <li>Track your orders</li>
          </ul>
          <p>We're excited to have you as part of our community!</p>
          <a href="${process.env.NEXTAUTH_URL}" class="button">Start Shopping</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Welcome to Lawlaw Delights!',
    html,
    text: `Hello ${name}! Thank you for joining Lawlaw Delights! Your account has been successfully created. Visit ${process.env.NEXTAUTH_URL} to start shopping.`
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #D2691E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>You requested a password reset for your Lawlaw Delights account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Lawlaw Delights',
    html,
    text: `You requested a password reset. Click this link to reset your password: ${resetUrl}. This link expires in 1 hour.`
  })
}

export async function sendOrderConfirmation(email: string, orderDetails: {
  orderId: string
  totalAmount: number
  shippingAddress: any
  orderItems: any[]
}): Promise<void> {
  const { orderId, totalAmount, shippingAddress, orderItems } = orderDetails

  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₱${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
        .total { font-weight: bold; font-size: 18px; color: #D2691E; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order!</h2>
          <p>Your order has been successfully placed and is being processed.</p>

          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Shipping Address:</strong><br>
            ${shippingAddress.street}<br>
            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
            ${shippingAddress.country}</p>

            <h4>Items Ordered:</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td colspan="3" style="text-align: right; padding: 15px; font-weight: bold;">Total Amount:</td>
                  <td class="total" style="padding: 15px; text-align: right;">₱${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>You will receive updates on your order status via email.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    html,
    text: `Your order ${orderId} has been confirmed. Total: ₱${totalAmount.toFixed(2)}. Thank you for shopping with Lawlaw Delights!`
  })
}

export async function sendSellerOrderNotification(email: string, orderDetails: {
  orderId: string
  buyerName: string
  productName: string
  quantity: number
  totalAmount: number
}): Promise<void> {
  const { orderId, buyerName, productName, quantity, totalAmount } = orderDetails

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Received!</h1>
        </div>
        <div class="content">
          <h2>Great news! You have a new order.</h2>
          <p>A customer has purchased your product. Here are the details:</p>

          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Buyer:</strong> ${buyerName}</p>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Total Amount:</strong> ₱${totalAmount.toFixed(2)}</p>
          </div>

          <p>Please prepare the product for shipping. You can view more details in your seller dashboard.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `New Order Received - ${orderId}`,
    html,
    text: `You have received a new order (${orderId}) for ${productName} (Qty: ${quantity}). Total: ₱${totalAmount.toFixed(2)}.`
  })
}

export async function sendAdminOrderNotification(email: string, orderDetails: {
  orderId: string
  buyerName: string
  buyerEmail: string
  totalAmount: number
  itemCount: number
}): Promise<void> {
  const { orderId, buyerName, buyerEmail, totalAmount, itemCount } = orderDetails

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Alert</h1>
        </div>
        <div class="content">
          <h2>A new order has been placed on Lawlaw Delights.</h2>

          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${buyerName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p><strong>Items:</strong> ${itemCount}</p>
            <p><strong>Total Amount:</strong> ₱${totalAmount.toFixed(2)}</p>
          </div>

          <p>Please review this order in the admin dashboard and ensure proper processing.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `New Order Alert - ${orderId}`,
    html,
    text: `New order ${orderId} placed by ${buyerName} (${buyerEmail}). Total: ₱${totalAmount.toFixed(2)}, Items: ${itemCount}.`
  })
}

export async function sendEmailVerification(email: string, name: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Lawlaw Delights</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #D2691E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering with Lawlaw Delights! To complete your registration, please verify your email address.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <div class="warning">
            <strong>Important:</strong> This link will expire in 24 hours for security reasons.
          </div>
          <p>If you didn't create an account with Lawlaw Delights, please ignore this email.</p>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Lawlaw Delights',
    html,
    text: `Hello ${name}! Please verify your email by clicking this link: ${verificationUrl}. This link expires in 24 hours.`
  })
}

export async function sendSellerApprovalNotification(email: string, name: string, businessName: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Congratulations! Your Seller Application is Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #D2691E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Great news! Your seller application for <strong>${businessName}</strong> has been approved!</p>
          <p>You can now:</p>
          <ul>
            <li>List and manage your products</li>
            <li>Receive orders from customers</li>
            <li>Track your sales and earnings</li>
            <li>Access seller analytics and insights</li>
          </ul>
          <p>Welcome to the Lawlaw Delights seller community!</p>
          <a href="${process.env.NEXTAUTH_URL}/seller" class="button">Access Seller Dashboard</a>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Congratulations! Your Seller Application is Approved - Lawlaw Delights',
    html,
    text: `Congratulations ${name}! Your seller application for ${businessName} has been approved. You can now access your seller dashboard at ${process.env.NEXTAUTH_URL}/seller.`
  })
}

export async function sendSellerRejectionNotification(email: string, name: string, businessName: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Seller Application Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #D2691E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We have reviewed your seller application for <strong>${businessName}</strong>.</p>
          <p>Unfortunately, we are unable to approve your application at this time. This decision was made after careful consideration of various factors.</p>
          <p>You can:</p>
          <ul>
            <li>Reapply after 3 months with additional information</li>
            <li>Contact our support team for feedback</li>
            <li>Continue shopping on our platform</li>
          </ul>
          <p>We appreciate your interest in becoming a seller on Lawlaw Delights and encourage you to apply again in the future.</p>
          <a href="${process.env.NEXTAUTH_URL}/contact" class="button">Contact Support</a>
          <p>If you have any questions, please don't hesitate to reach out.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Seller Application Update - Lawlaw Delights',
    html,
    text: `Hello ${name}, we have reviewed your seller application for ${businessName} and unfortunately are unable to approve it at this time. You can reapply after 3 months or contact support for feedback.`
  })
}
