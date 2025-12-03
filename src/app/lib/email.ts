// Email service with improved deliverability and professional templates

import sgMail from '@sendgrid/mail'
import { sendEmailFallback, sendOtpEmailFallback } from './email-fallback'

// Only set API key if it exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
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

// Generic send email function with improved deliverability
export async function sendEmail(options: EmailOptions) {
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL || '';
  const senderName = 'Bulan Lawlaw Delicacy System';

  // Check if SendGrid is properly configured
  if (!senderEmail || !process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ SendGrid not configured, using fallback email logging');
    await sendEmailFallback(options);
    return;
  }

  try {
    console.log(`Attempting to send email to: ${options.to} from: ${senderEmail}`);

    await sgMail.send({
      to: options.to,
      from: {
        email: senderEmail,
        name: senderName
      },
      replyTo: {
        email: senderEmail,
        name: senderName
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
      // Remove high priority headers - they can trigger spam filters
      headers: {
        'X-Entity-Ref-ID': `blds-${Date.now()}`,
        'List-Unsubscribe': `<mailto:${senderEmail}?subject=unsubscribe>`,
      },
      // Disable click/open tracking - tracking links can trigger spam filters
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false
        },
        openTracking: {
          enable: false
        },
        subscriptionTracking: {
          enable: false
        }
      },
      // Mail settings
      mailSettings: {
        sandboxMode: {
          enable: false
        },
        bypassListManagement: {
          enable: false
        }
      },
      // Category for better analytics
      categories: ['transactional'],
    });

    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error: any) {
    console.error('❌ Error sending email via SendGrid:');
    if (error.response && error.response.body) {
      console.error('SendGrid Error Response:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error('Error details:', error.message || error);
    }

    // Use fallback instead of throwing error
    console.warn('⚠️ Falling back to console logging');
    await sendEmailFallback(options);
  }
}

// Email template wrapper for consistent styling
function getEmailTemplate(content: string): string {
  // Professional SVG logo for email - fish/wave design representing Lawlaw delicacy
  const logoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
      <!-- Circular background -->
      <circle cx="30" cy="30" r="28" fill="#2E7D32"/>
      <!-- Fish body -->
      <ellipse cx="28" cy="30" rx="14" ry="8" fill="white"/>
      <!-- Fish tail -->
      <path d="M40 30L48 24L48 36L40 30Z" fill="white"/>
      <!-- Fish eye -->
      <circle cx="20" cy="28" r="2.5" fill="#2E7D32"/>
      <!-- Wave lines under fish -->
      <path d="M12 40C16 38 20 42 24 40C28 38 32 42 36 40C40 38 44 42 48 40" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M12 45C16 43 20 47 24 45C28 43 32 47 36 45C40 43 44 47 48 45" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
    </svg>
  `;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bulan Lawlaw Delicacy System</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f4; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4; padding:20px 0;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:white; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.1); overflow:hidden; max-width:600px;">

            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); padding:40px 30px; text-align:center;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="background:white; border-radius:50%; width:80px; height:80px; display:inline-block; text-align:center; line-height:80px; margin-bottom:15px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                        ${logoSvg}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <h1 style="color:white; margin:0; font-size:32px; font-weight:700; letter-spacing:-0.5px;">Bulan Lawlaw</h1>
                      <p style="color:rgba(255,255,255,0.95); margin:8px 0 0 0; font-size:16px; font-weight:400;">Delicacy System</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 30px;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; padding:30px; border-top:1px solid #e5e7eb;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <p style="font-size:14px; color:#6b7280; margin:0 0 15px 0; line-height:1.6;">
                        This email was sent from <strong>Bulan Lawlaw Delicacy System</strong><br>
                        Your trusted source for premium Lawlaw products
                      </p>
                      <div style="margin:20px 0;">
                        <a href="${process.env.NEXTAUTH_URL}" style="display:inline-block; margin:0 10px; color:#2E7D32; text-decoration:none; font-size:14px; font-weight:500;">Visit Website</a>
                        <span style="color:#d1d5db;">|</span>
                        <a href="${process.env.NEXTAUTH_URL}/contact" style="display:inline-block; margin:0 10px; color:#2E7D32; text-decoration:none; font-size:14px; font-weight:500;">Contact Support</a>
                        <span style="color:#d1d5db;">|</span>
                        <a href="${process.env.NEXTAUTH_URL}/help" style="display:inline-block; margin:0 10px; color:#2E7D32; text-decoration:none; font-size:14px; font-weight:500;">Help Center</a>
                      </div>
                      <p style="font-size:12px; color:#9ca3af; margin:15px 0 0 0;">
                        &copy; ${new Date().getFullYear()} Bulan Lawlaw Delicacy System. All rights reserved.<br>
                        Bulan, Sorsogon, Philippines
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Spam Score Improver - Small Disclaimer -->
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; margin-top:20px;">
            <tr>
              <td align="center" style="padding:10px;">
                <p style="font-size:11px; color:#9ca3af; margin:0; line-height:1.4;">
                  You received this email because you have an account with Bulan Lawlaw Delicacy System.<br>
                  If you believe this was sent in error, please contact us at ${process.env.SENDGRID_SENDER_EMAIL}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// OTP verification email with improved template
export async function sendOtpEmail(email: string, name: string, otpCode: string) {
  // Check if SendGrid is configured, otherwise use fallback
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
    console.warn('⚠️ SendGrid not configured, using fallback OTP logging');
    await sendOtpEmailFallback(email, name, otpCode);
    return;
  }

  // Mail icon SVG for OTP verification
  const mailIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  `;

  // Lock icon SVG for security tips
  const lockIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:6px;">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#f0fdf4; border-radius:12px; padding:20px; margin-bottom:30px; display:inline-block;">
        ${mailIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">Email Verification Required</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7; text-align:center;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size:16px; color:#374151; margin:0 0 30px 0; line-height:1.7;">
      Thank you for registering with <strong>Bulan Lawlaw Delicacy System</strong>. To complete your registration and verify your email address, please use the verification code below:
    </p>

    <!-- OTP Code Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
      <tr>
        <td align="center">
          <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border:3px dashed #2E7D32; border-radius:12px; padding:30px; display:inline-block;">
            <p style="font-size:14px; color:#16a34a; margin:0 0 10px 0; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Your Verification Code</p>
            <div style="font-size:48px; font-weight:900; letter-spacing:12px; color:#2E7D32; font-family:'Courier New', monospace; text-align:center;">
              ${otpCode}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:20px; border-radius:8px; margin:30px 0;">
      <p style="font-size:14px; color:#92400e; margin:0; line-height:1.6;">
        <strong>Important Security Notice:</strong><br>
        This code will expire in <strong>5 minutes</strong> for your security. Please complete the verification process as soon as possible.
      </p>
    </div>

    <div style="background:#f3f4f6; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:14px; color:#4b5563; margin:0 0 10px 0; line-height:1.6;">
        <strong>${lockIconSvg}Security Tips:</strong>
      </p>
      <ul style="font-size:14px; color:#6b7280; margin:0; padding-left:20px; line-height:1.8;">
        <li>Never share this code with anyone</li>
        <li>We will never ask for this code via phone or email</li>
        <li>If you didn't request this code, please ignore this email</li>
      </ul>
    </div>

    <p style="font-size:14px; color:#6b7280; margin:25px 0 0 0; line-height:1.6; text-align:center;">
      If you didn't create an account with us, you can safely ignore this email or<br>
      <a href="${process.env.NEXTAUTH_URL}/contact" style="color:#2E7D32; text-decoration:none; font-weight:600;">contact our support team</a> for assistance.
    </p>
  `;

  const html = getEmailTemplate(content);

  try {
    await sendEmail({
      to: email,
      subject: `Your Bulan Lawlaw Verification Code`,
      html,
      text: `Hello ${name},\n\nThank you for registering with Bulan Lawlaw Delicacy System.\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nBulan Lawlaw Delicacy System Team`
    })
  } catch (error) {
    console.error('Error in sendOtpEmail:', error);
    await sendOtpEmailFallback(email, name, otpCode);
  }
}

// Order confirmation email with improved template
export async function sendOrderConfirmation(email: string, orderDetails: {
  orderId: string
  totalAmount: number
  shippingAddress: ShippingAddress
  orderItems: OrderItem[]
}) {
  const { orderId, totalAmount, shippingAddress, orderItems } = orderDetails

  const itemsHtml = orderItems.map(item => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:15px 10px; font-size:14px; color:#374151;">
        <strong>${item.product.name}</strong>
      </td>
      <td style="padding:15px 10px; text-align:center; font-size:14px; color:#6b7280;">
        ${item.quantity}
      </td>
      <td style="padding:15px 10px; text-align:right; font-size:14px; color:#6b7280;">
        ₱${item.price.toFixed(2)}
      </td>
      <td style="padding:15px 10px; text-align:right; font-size:14px; color:#1f2937; font-weight:600;">
        ₱${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('')

  // Checkmark icon SVG
  const checkIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#dcfce7; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${checkIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 15px 0; font-size:28px; font-weight:700; text-align:center;">Order Confirmed!</h2>

    <p style="font-size:16px; color:#6b7280; margin:0 0 30px 0; text-align:center;">
      Order #<strong style="color:#2E7D32;">${orderId}</strong>
    </p>

    <div style="background:#f0fdf4; border-left:4px solid #2E7D32; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:16px; color:#166534; margin:0; line-height:1.7;">
        Thank you for your order! We've received your order and will begin processing it shortly. You'll receive another email when your order ships.
      </p>
    </div>

    <!-- Order Items -->
    <div style="margin:30px 0;">
      <h3 style="color:#1f2937; font-size:20px; font-weight:600; margin:0 0 20px 0; padding-bottom:10px; border-bottom:2px solid #2E7D32;">
        Order Items
      </h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:15px 10px; text-align:left; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Product</th>
            <th style="padding:15px 10px; text-align:center; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Qty</th>
            <th style="padding:15px 10px; text-align:right; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Price</th>
            <th style="padding:15px 10px; text-align:right; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr style="background:#f9fafb;">
            <td colspan="3" style="padding:20px 10px; text-align:right; font-size:16px; font-weight:700; color:#1f2937;">
              Grand Total:
            </td>
            <td style="padding:20px 10px; text-align:right; font-size:20px; font-weight:800; color:#2E7D32;">
              ₱${totalAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Shipping Address -->
    <div style="margin:30px 0;">
      <h3 style="color:#1f2937; font-size:20px; font-weight:600; margin:0 0 15px 0;">
        Shipping Address
      </h3>
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:20px;">
        <p style="font-size:15px; color:#374151; margin:0; line-height:1.8;">
          ${shippingAddress.street}<br>
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
          ${shippingAddress.country}
        </p>
      </div>
    </div>

    <!-- Action Button -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
      <tr>
        <td align="center">
          <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(46, 125, 50, 0.3);">
          View Order Details
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:14px; color:#6b7280; margin:25px 0 0 0; line-height:1.7; text-align:center;">
      Questions about your order? <a href="${process.env.NEXTAUTH_URL}/contact" style="color:#2E7D32; text-decoration:none; font-weight:600;">Contact us</a> anytime.
    </p>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: `Order Confirmation #${orderId} - Bulan Lawlaw Delicacy System`,
    html,
    text: `Order Confirmed!\n\nOrder #${orderId}\nTotal: ₱${totalAmount.toFixed(2)}\n\nShipping to:\n${shippingAddress.street}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}\n${shippingAddress.country}\n\nThank you for your order!`
  })
}

// Registration confirmation email
export async function sendRegistrationConfirmation(email: string, name: string) {
  // Welcome hand wave icon
  const welcomeIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0"/>
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/>
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#dbeafe; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${welcomeIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">Welcome to Bulan Lawlaw!</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Thank you for joining our community! We're excited to have you on board. You can now explore our premium selection of Lawlaw delicacies and start shopping.
    </p>

    <div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:15px; color:#1e40af; margin:0; line-height:1.7;">
        <strong>Get Started:</strong> Browse our fresh and processed Lawlaw products, chat with sellers, and enjoy a seamless shopping experience!
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
      <tr>
        <td align="center">
          <a href="${process.env.NEXTAUTH_URL}/products" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(46, 125, 50, 0.3);">
            Start Shopping
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: 'Welcome to Bulan Lawlaw Delicacy System',
    html,
    text: `Hello ${name}!\n\nWelcome to Bulan Lawlaw Delicacy System! Thank you for joining our community.\n\nVisit ${process.env.NEXTAUTH_URL}/products to start shopping for premium Lawlaw products.\n\nBest regards,\nBulan Lawlaw Team`
  })
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  // Lock/key icon for password reset
  const lockIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#fee2e2; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${lockIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">Password Reset Request</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block; background:linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(220, 38, 38, 0.3);">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:14px; color:#92400e; margin:0; line-height:1.6;">
        <strong>Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
      </p>
    </div>

    <p style="font-size:14px; color:#6b7280; margin:25px 0 0 0; line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>

    <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin:20px 0;">
      <p style="font-size:13px; color:#6b7280; margin:0; line-height:1.6;">
        <strong>Link not working?</strong> Copy and paste this URL into your browser:<br>
        <code style="background:#e5e7eb; padding:4px 8px; border-radius:4px; font-size:12px; word-break:break-all;">${resetUrl}</code>
      </p>
    </div>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Bulan Lawlaw System',
    html,
    text: `Password Reset Request\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
  })
}

// Email verification
export async function sendEmailVerification(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  // Email verification icon
  const emailVerifyIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#dbeafe; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${emailVerifyIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">Verify Your Email</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Please verify your email address to complete your registration and access all features of Bulan Lawlaw Delicacy System.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
      <tr>
        <td align="center">
          <a href="${verificationUrl}" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(46, 125, 50, 0.3);">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>

    <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:14px; color:#92400e; margin:0; line-height:1.6;">
        <strong>Important:</strong> This verification link will expire in <strong>24 hours</strong>.
      </p>
    </div>

    <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin:20px 0;">
      <p style="font-size:13px; color:#6b7280; margin:0; line-height:1.6;">
        <strong>Link not working?</strong> Copy and paste this URL into your browser:<br>
        <code style="background:#e5e7eb; padding:4px 8px; border-radius:4px; font-size:12px; word-break:break-all;">${verificationUrl}</code>
      </p>
    </div>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Bulan Lawlaw System',
    html,
    text: `Hello ${name},\n\nPlease verify your email address by clicking this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`
  })
}

// Seller approval
export async function sendSellerApprovalNotification(email: string, name: string, businessName: string) {
  // Trophy/celebration icon for approval
  const trophyIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#dcfce7; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${trophyIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">Congratulations!</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Great news! Your seller application for <strong>${businessName}</strong> has been approved! You can now start selling your products on our platform.
    </p>

    <div style="background:#dcfce7; border-left:4px solid #2E7D32; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:15px; color:#166534; margin:0; line-height:1.7;">
        <strong>Next Steps:</strong><br>
        - Set up your seller profile<br>
        - Add your first products<br>
        - Start receiving orders!
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
      <tr>
        <td align="center">
          <a href="${process.env.NEXTAUTH_URL}/profile" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(46, 125, 50, 0.3);">
            Go to Seller Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: `Seller Application Approved - ${businessName}`,
    html,
    text: `Hello ${name},\n\nYour seller application for ${businessName} has been approved!\n\nVisit ${process.env.NEXTAUTH_URL}/profile to access your seller dashboard.`
  })
}

// Seller rejection
export async function sendSellerRejectionNotification(email: string, name: string, businessName: string) {
  // Clipboard/document icon for application update
  const clipboardIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/>
      <path d="M12 16h4"/>
      <path d="M8 11h.01"/>
      <path d="M8 16h.01"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#fee2e2; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${clipboardIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">Seller Application Update</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      Thank you for your interest in becoming a seller on our platform. After careful review, we regret to inform you that your application for <strong>${businessName}</strong> was not approved at this time.
    </p>

    <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:20px; border-radius:8px; margin:25px 0;">
      <p style="font-size:15px; color:#92400e; margin:0; line-height:1.7;">
        <strong>What's Next?</strong><br>
        - You may reapply after 3 months<br>
        - Contact our support team for detailed feedback<br>
        - Review our seller guidelines and requirements
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;">
      <tr>
        <td align="center">
          <a href="${process.env.NEXTAUTH_URL}/contact" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(46, 125, 50, 0.3);">
            Contact Support
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: 'Seller Application Update - Bulan Lawlaw System',
    html,
    text: `Hello ${name},\n\nYour seller application for ${businessName} was not approved at this time.\n\nYou may reapply after 3 months or contact support for feedback.`
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

  const content = `
    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:24px; font-weight:700;">New Order Alert</h2>

    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:20px; margin:20px 0;">
      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Order ID</p>
      <p style="font-size:18px; color:#2E7D32; font-weight:700; margin:0 0 15px 0;">#${orderId}</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Customer</p>
      <p style="font-size:16px; color:#1f2937; margin:0 0 15px 0;">${buyerName} (${buyerEmail})</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Items</p>
      <p style="font-size:16px; color:#1f2937; margin:0 0 15px 0;">${itemCount} items</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Total Amount</p>
      <p style="font-size:20px; color:#2E7D32; font-weight:700; margin:0;">₱${totalAmount.toFixed(2)}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
      <tr>
        <td align="center">
          <a href="${process.env.NEXTAUTH_URL}/admin" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:14px 30px; border-radius:8px; font-size:14px; font-weight:600;">
            View in Admin Panel
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: `New Order #${orderId} - Bulan Lawlaw System`,
    html,
    text: `New Order Alert\n\nOrder: ${orderId}\nCustomer: ${buyerName} (${buyerEmail})\nItems: ${itemCount}\nTotal: ₱${totalAmount.toFixed(2)}`
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

  // Package/box icon for new order
  const packageIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  `;

  const content = `
    <div style="text-align:center;">
      <div style="background:#dcfce7; border-radius:50%; width:100px; height:100px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px;">
        ${packageIconSvg}
      </div>
    </div>

    <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700; text-align:center;">New Order Received!</h2>

    <p style="font-size:16px; color:#374151; margin:0 0 25px 0; line-height:1.7;">
      You have a new order for your product. Please prepare it for shipment.
    </p>

    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:20px; margin:20px 0;">
      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Order ID</p>
      <p style="font-size:18px; color:#2E7D32; font-weight:700; margin:0 0 15px 0;">#${orderId}</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Customer</p>
      <p style="font-size:16px; color:#1f2937; margin:0 0 15px 0;">${buyerName}</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Product</p>
      <p style="font-size:16px; color:#1f2937; margin:0 0 15px 0;">${productName}</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Quantity</p>
      <p style="font-size:16px; color:#1f2937; margin:0 0 15px 0;">${quantity}</p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 5px 0;">Total Amount</p>
      <p style="font-size:20px; color:#2E7D32; font-weight:700; margin:0;">₱${totalAmount.toFixed(2)}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
      <tr>
        <td align="center">
          <a href="${process.env.NEXTAUTH_URL}/profile" style="display:inline-block; background:linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color:white; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; box-shadow:0 4px 6px rgba(46, 125, 50, 0.3);">
            View Order Details
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = getEmailTemplate(content);

  await sendEmail({
    to: email,
    subject: `New Order #${orderId} - ${productName}`,
    html,
    text: `New Order Received!\n\nOrder: ${orderId}\nCustomer: ${buyerName}\nProduct: ${productName}\nQuantity: ${quantity}\nTotal: ₱${totalAmount.toFixed(2)}`
  })
}
