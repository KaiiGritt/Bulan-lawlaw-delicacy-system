import nodemailer from 'nodemailer';

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface OrderTrackingEmailData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDeliveryDate?: string;
  description?: string;
}

export async function sendOrderTrackingEmail(data: OrderTrackingEmailData) {
  const {
    customerEmail,
    customerName,
    orderId,
    status,
    trackingNumber,
    courier,
    estimatedDeliveryDate,
    description
  } = data;

  const statusMessages: Record<string, string> = {
    pending: 'Your order has been received and is being processed.',
    processing: 'Your order is currently being prepared for shipment.',
    shipped: 'Great news! Your order has been shipped and is on its way to you.',
    out_for_delivery: 'Your order is out for delivery and should arrive soon!',
    delivered: 'Your order has been successfully delivered. Enjoy your Lawlaw delicacies!',
    cancelled: 'Your order has been cancelled.'
  };

  const statusMessage = statusMessages[status] || 'Your order status has been updated.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order ${status.charAt(0).toUpperCase() + status.slice(1)}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #22c55e;
        }
        .header h1 {
          color: #22c55e;
          margin: 0;
          font-size: 28px;
        }
        .status-badge {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          margin: 20px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
        .status-shipped { background-color: #e9d5ff; color: #6b21a8; }
        .status-out_for_delivery { background-color: #fce7f3; color: #9f1239; }
        .status-delivered { background-color: #d1fae5; color: #065f46; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .info-box {
          background-color: #f9fafb;
          border-left: 4px solid #22c55e;
          padding: 15px;
          margin: 20px 0;
        }
        .info-box p {
          margin: 5px 0;
        }
        .info-box strong {
          color: #22c55e;
        }
        .tracking-info {
          background-color: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #22c55e;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍤 Lawlaw Delights</h1>
          <p>Order Tracking Update</p>
        </div>

        <p>Hello ${customerName},</p>

        <p>${statusMessage}</p>

        <div style="text-align: center;">
          <span class="status-badge status-${status}">
            ${status.replace('_', ' ')}
          </span>
        </div>

        ${description ? `<p><em>${description}</em></p>` : ''}

        <div class="info-box">
          <p><strong>Order ID:</strong> ${orderId}</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          ${courier ? `<p><strong>Courier:</strong> ${courier}</p>` : ''}
        </div>

        ${trackingNumber && courier ? `
          <div class="tracking-info">
            <h3 style="margin-top: 0; color: #22c55e;">📦 Tracking Information</h3>
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p><strong>Courier Service:</strong> ${courier}</p>
            ${estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${new Date(estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
          </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" class="button">
            View Order Details
          </a>
        </div>

        <div class="footer">
          <p>Thank you for choosing Lawlaw Delights!</p>
          <p>If you have any questions, please contact us at info@lawlawdelights.com</p>
          <p>&copy; ${new Date().getFullYear()} Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Lawlaw Delights - Order Tracking Update

    Hello ${customerName},

    ${statusMessage}

    Order Status: ${status.toUpperCase().replace('_', ' ')}
    ${description ? `\n${description}\n` : ''}

    Order ID: ${orderId}
    ${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}
    ${courier ? `Courier: ${courier}` : ''}
    ${estimatedDeliveryDate ? `Estimated Delivery: ${new Date(estimatedDeliveryDate).toLocaleDateString()}` : ''}

    View your order details: ${process.env.NEXTAUTH_URL}/orders/${orderId}

    Thank you for choosing Lawlaw Delights!

    ---
    © ${new Date().getFullYear()} Lawlaw Delights. All rights reserved.
  `;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    await transporter.sendMail({
      from: `"Lawlaw Delights" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - Order #${orderId.slice(0, 8)}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Tracking email sent to ${customerEmail} for order ${orderId}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending tracking email:', error);
    return { success: false, message: 'Failed to send email', error };
  }
}

// SMS notification placeholder (can be integrated with services like Twilio, Semaphore, etc.)
export async function sendOrderTrackingSMS(phoneNumber: string, orderId: string, status: string, trackingNumber?: string) {
  // TODO: Integrate with SMS service provider
  console.log(`SMS notification would be sent to ${phoneNumber} for order ${orderId} with status ${status}`);

  // Example SMS message
  const message = `Lawlaw Delights: Your order #${orderId.slice(0, 8)} is now ${status.toUpperCase()}. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`;

  return { success: true, message: 'SMS notification logged (not sent - integration pending)' };
}
