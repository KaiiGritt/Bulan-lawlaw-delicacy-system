// Removed all duplicate function declarations in src/app/lib/email.ts
// The file now contains unique function declarations only, resolving build errors

import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Fix environment variable name for sender email if needed
const getSenderEmail = (): string => {
  return process.env.SENDGRID_SENDER || process.env.SENDGRID_SENDER_EMAIL || ''
}

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

// Generic send email function
export async function sendEmail(options: EmailOptions) {
  try {
    console.log('Using SENDGRID_SENDER:', process.env.SENDGRID_SENDER)
    console.log('Using SENDGRID_SENDER_EMAIL:', process.env.SENDGRID_SENDER_EMAIL)
    await sgMail.send({
      to: options.to,
      from: process.env.SENDGRID_SENDER_EMAIL || '', // use SENDGRID_SENDER_EMAIL as verified sender since SENDGRID_SENDER is missing
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    console.log(`Email sent successfully to ${options.to}`)
  } catch (error: any) {
    if (error.response && error.response.body) {
      console.error('Error sending email:', error.response.body)
    } else {
      console.error('Error sending email:', error.message || error)
    }
    throw new Error('Failed to send email')
  }
}

// Registration confirmation email
export async function sendRegistrationConfirmation(email: string, name: string) {
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>Welcome to Lawlaw Delights, ${name}!</h1>
    <p>Thank you for joining our community! Start exploring our delicious Filipino products now.</p>
    <a href="${process.env.NEXTAUTH_URL}" style="display:inline-block; padding:12px 24px; background:#D2691E; color:white; text-decoration:none; border-radius:5px;">Start Shopping</a>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: 'Welcome to Lawlaw Delights!',
    html,
    text: `Hello ${name}! Welcome to Lawlaw Delights! Visit ${process.env.NEXTAUTH_URL} to start shopping.`
  })
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>Password Reset Request</h1>
    <p>Click the button below to reset your password (expires in 1 hour):</p>
    <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#D2691E; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
    <p>If the button doesn't work, copy and paste this URL into your browser: ${resetUrl}</p>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Lawlaw Delights',
    html,
    text: `Reset your password using this link: ${resetUrl} (expires in 1 hour).`
  })
}

// Order confirmation email
export async function sendOrderConfirmation(email: string, orderDetails: {
  orderId: string
  totalAmount: number
  shippingAddress: ShippingAddress
  orderItems: OrderItem[]
}) {
  const { orderId, totalAmount, shippingAddress, orderItems } = orderDetails

  const itemsHtml = orderItems.map(item => `
    <tr>
      <td>${item.product.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">₱${item.price.toFixed(2)}</td>
      <td style="text-align:right;">₱${(item.price*item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>Order Confirmation</h1>
    <p>Thank you! Your order ${orderId} has been placed.</p>
    <h3>Shipping Address:</h3>
    <p>${shippingAddress.street}<br>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>${shippingAddress.country}</p>
    <h3>Items:</h3>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th>Product</th><th>Qty</th><th>Price</th><th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="3" style="text-align:right; font-weight:bold;">Total:</td>
          <td style="text-align:right; font-weight:bold;">₱${totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    html,
    text: `Order ${orderId} confirmed. Total: ₱${totalAmount.toFixed(2)}.`
  })
}

// Email verification
export async function sendEmailVerification(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>Verify Your Email</h1>
    <p>Hello ${name}, click below to verify your email (expires in 24 hours):</p>
    <a href="${verificationUrl}" style="display:inline-block; padding:12px 24px; background:#D2691E; color:white; text-decoration:none; border-radius:5px;">Verify Email</a>
    <p>Or copy-paste this URL: ${verificationUrl}</p>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Lawlaw Delights',
    html,
    text: `Verify your email: ${verificationUrl}`
  })
}

// Seller approval
export async function sendSellerApprovalNotification(email: string, name: string, businessName: string) {
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>Seller Application Approved!</h1>
    <p>Hello ${name}, your seller application for ${businessName} has been approved!</p>
    <a href="${process.env.NEXTAUTH_URL}/seller" style="display:inline-block; padding:12px 24px; background:#D2691E; color:white; text-decoration:none; border-radius:5px;">Go to Seller Dashboard</a>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: 'Seller Application Approved - Lawlaw Delights',
    html,
    text: `Hello ${name}, your seller application for ${businessName} has been approved!`
  })
}

// Seller rejection
export async function sendSellerRejectionNotification(email: string, name: string, businessName: string) {
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>Seller Application Update</h1>
    <p>Hello ${name}, your seller application for ${businessName} was not approved at this time.</p>
    <p>You may reapply after 3 months or contact support for feedback.</p>
    <a href="${process.env.NEXTAUTH_URL}/contact" style="display:inline-block; padding:12px 24px; background:#D2691E; color:white; text-decoration:none; border-radius:5px;">Contact Support</a>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: 'Seller Application Update - Lawlaw Delights',
    html,
    text: `Hello ${name}, your seller application for ${businessName} was not approved at this time.`
  })
}

// Admin notification
export async function sendAdminOrderNotification(email: string, orderDetails: {
  orderId: string
  buyerName: string
  buyerEmail: string
  totalAmount: number
  itemCount: number
}) {
  const { orderId, buyerName, buyerEmail, totalAmount, itemCount } = orderDetails
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>New Order Alert</h1>
    <p>Order ${orderId} placed by ${buyerName} (${buyerEmail}).</p>
    <p>Items: ${itemCount}, Total: ₱${totalAmount.toFixed(2)}</p>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: `New Order Alert - ${orderId}`,
    html,
    text: `New order ${orderId} by ${buyerName} (${buyerEmail}). Total: ₱${totalAmount.toFixed(2)}, Items: ${itemCount}`
  })
}

// Seller order notification
export async function sendSellerOrderNotification(email: string, orderDetails: {
  orderId: string
  buyerName: string
  productName: string
  quantity: number
  totalAmount: number
}) {
  const { orderId, buyerName, productName, quantity, totalAmount } = orderDetails
  const html = `
  <div style="font-family: Arial,sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h1>New Order Received</h1>
    <p>Order ${orderId} from ${buyerName} for ${productName} (Qty: ${quantity}, Total: ₱${totalAmount.toFixed(2)})</p>
    <p>&copy; 2024 Lawlaw Delights</p>
  </div>
  `
  await sendEmail({
    to: email,
    subject: `New Order Received - ${orderId}`,
    html,
    text: `New order ${orderId} from ${buyerName} for ${productName} (Qty: ${quantity}, Total: ₱${totalAmount.toFixed(2)})`
  })
}
