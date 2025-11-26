import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { sendEmail } from '../../../../../lib/email';

// POST /api/admin/campaigns/[id]/send - Send campaign
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }

    // Get target users based on audience (filter out users who unsubscribed from marketing)
    let users;
    const baseFilter = { marketingEmails: true }; // Only send to users who opted in

    switch (campaign.targetAudience) {
      case 'sellers':
        users = await prisma.user.findMany({ where: { ...baseFilter, role: 'seller' } });
        break;
      case 'users':
        users = await prisma.user.findMany({ where: { ...baseFilter, role: 'user' } });
        break;
      case 'inactive':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        users = await prisma.user.findMany({
          where: { ...baseFilter, updatedAt: { lt: thirtyDaysAgo } }
        });
        break;
      default:
        users = await prisma.user.findMany({ where: baseFilter });
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails based on campaign type
    if (campaign.type === 'email') {
      for (const user of users) {
        try {
          const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/api/unsubscribe?email=${encodeURIComponent(user.email)}`;

          await sendEmail({
            to: user.email,
            subject: campaign.subject,
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9f9f9;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9; padding:20px;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #D2691E 0%, #8FBC8F 100%); padding:30px; text-align:center;">
                            <h1 style="color:white; margin:0; font-size:28px;">Lawlaw Delights</h1>
                          </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                          <td style="padding:40px 30px;">
                            <h2 style="color:#D2691E; margin:0 0 20px 0;">${campaign.subject}</h2>
                            <div style="margin:20px 0; color:#333; line-height:1.6;">
                              ${campaign.message}
                            </div>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#f9f9f9; padding:20px 30px; border-top:1px solid #ddd;">
                            <p style="font-size:12px; color:#999; margin:0; text-align:center; line-height:1.5;">
                              &copy; 2024 Lawlaw Delights. All rights reserved.<br>
                              <a href="${unsubscribeUrl}" style="color:#D2691E; text-decoration:none;">Unsubscribe</a> from marketing emails
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
            text: `${campaign.message}\n\n---\nTo unsubscribe from marketing emails, visit: ${unsubscribeUrl}`
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${user.email}:`, error);
          failCount++;
        }
      }
    } else if (campaign.type === 'push') {
      // Create push notifications
      await prisma.notification.createMany({
        data: users.map(user => ({
          userId: user.id,
          title: campaign.subject,
          message: campaign.message,
          type: 'campaign'
        }))
      });
      successCount = users.length;
    }

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: failCount > 0 && successCount === 0 ? 'failed' : 'sent',
        sentAt: new Date(),
        recipientCount: users.length
      }
    });

    return NextResponse.json({
      message: 'Campaign sent successfully',
      campaign: updatedCampaign,
      stats: {
        total: users.length,
        success: successCount,
        failed: failCount
      }
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
