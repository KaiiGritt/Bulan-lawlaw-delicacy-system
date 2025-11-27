import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../auth/[...nextauth]/route';
import { prisma } from '../../../../../../lib/prisma';

// POST /api/products/[id]/reviews/[reviewId]/reply - Seller replies to a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId, reviewId } = await params;
    const { reply } = await request.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    // Check if product exists and belongs to the seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Only the product owner (seller) can reply
    if (product.userId !== session.user.id) {
      return NextResponse.json({ error: 'Only the seller can reply to reviews' }, { status: 403 });
    }

    // Check if review exists
    const review = await prisma.comment.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.productId !== productId) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update the review with seller's reply
    const updatedReview = await prisma.comment.update({
      where: { id: reviewId },
      data: {
        sellerReply: reply.trim(),
        sellerReplyAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error submitting seller reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[id]/reviews/[reviewId]/reply - Delete seller reply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId, reviewId } = await params;

    // Check if product exists and belongs to the seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Only the product owner (seller) can delete their reply
    if (product.userId !== session.user.id) {
      return NextResponse.json({ error: 'Only the seller can delete their reply' }, { status: 403 });
    }

    // Remove the reply
    await prisma.comment.update({
      where: { id: reviewId },
      data: {
        sellerReply: null,
        sellerReplyAt: null,
      },
    });

    return NextResponse.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
