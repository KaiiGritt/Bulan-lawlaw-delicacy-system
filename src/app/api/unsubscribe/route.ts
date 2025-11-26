import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

// GET /api/unsubscribe?email=xxx - Unsubscribe from marketing emails
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { marketingEmails: false }
    });

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - Lawlaw Delights</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #f9f9f9 0%, #e8f5e9 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #D2691E; }
          p { color: #666; line-height: 1.6; }
          a { color: #D2691E; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✓ You've Been Unsubscribed</h1>
          <p>You have successfully unsubscribed from marketing emails.</p>
          <p>You will no longer receive promotional offers and newsletters from Lawlaw Delights.</p>
          <p><strong>Note:</strong> You will still receive important account-related emails such as order confirmations and password resets.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}">Return to Lawlaw Delights</a>
          </p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
