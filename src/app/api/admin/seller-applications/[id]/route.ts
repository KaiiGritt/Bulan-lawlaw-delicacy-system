// /app/api/admin/seller-applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { sendSellerApprovalNotification, sendSellerRejectionNotification } from '../../../../lib/email';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    console.log('PATCH request for application id:', id);

    // Check admin session
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session || session.user.role !== 'admin') {
      console.error('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
    }

    // Parse and validate body
    const body = await req.json();
    console.log('Request body:', body);

    const { status } = body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      console.error('Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected".' },
        { status: 400 }
      );
    }

    // Check if the application exists
    const application = await prisma.seller_applications.findUnique({
      where: { applicationId: parseInt(id) },
      include: { users: { select: { userId: true, name: true, email: true, role: true } } },
    });

    if (!application) {
      console.error('Application not found for id:', id);
      return NextResponse.json({ error: 'Seller application not found.' }, { status: 404 });
    }

    console.log('Application found:', application);

    // Update the application status
    const updatedApplication = await prisma.seller_applications.update({
      where: { applicationId: parseInt(id) },
      data: { status },
      include: { users: { select: { userId: true, name: true, email: true, role: true } } },
    });

    console.log('Application updated:', updatedApplication);

    // Update user role if approved
    if (status === 'approved') {
      if (!updatedApplication.users) {
        console.warn('No user associated with this application:', id);
        return NextResponse.json(
          { error: 'Cannot approve application: no user linked.' },
          { status: 400 }
        );
      }

      console.log('Updating user role to seller for user id:', updatedApplication.users.userId);

      try {
        await prisma.users.update({
          where: { userId: updatedApplication.users.userId },
          data: { role: 'seller' },
        });

        // Create in-app notification
        await prisma.notifications.create({
          data: {
            userId: updatedApplication.users.userId,
            title: 'Seller Application Approved!',
            message: `Congratulations! Your seller application for "${updatedApplication.businessName}" has been approved. You can now start selling your products.`,
            type: 'seller_approval',
          },
        });

        // Send approval notification email
        try {
          await sendSellerApprovalNotification(
            updatedApplication.users.email,
            updatedApplication.users.name || 'Seller',
            updatedApplication.businessName
          );
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the approval if email fails
        }
      } catch (userError) {
        console.error('Failed to update user role:', userError);
        return NextResponse.json(
          { error: 'Application approved but failed to update user role.' },
          { status: 500 }
        );
      }
    } else if (status === 'rejected') {
      // Send rejection notification email
      try {
        await sendSellerRejectionNotification(
          updatedApplication.users.email,
          updatedApplication.users.name || 'Applicant',
          updatedApplication.businessName
        );
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Don't fail the rejection if email fails
      }
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Server error in PATCH /seller-applications/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 }
    );
  }
}
