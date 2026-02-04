import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';

// GET /api/products/[id]/reviews - Get all reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviewsRaw = await prisma.comments.findMany({
      where: { productId: parseInt(id) },
      include: {
        users: {
          select: {
            userId: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map IDs for frontend compatibility
    const reviews = reviewsRaw.map(review => ({
      ...review,
      id: review.commentId,
      users: {
        ...review.users,
        id: String(review.users.userId),
      }
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, content } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { productId: parseInt(id) },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.comments.findFirst({
      where: {
        productId: parseInt(id),
        userId: parseInt(session.user.id),
      },
    });

    if (existingReview) {
      // Update existing review
      await prisma.comments.update({
        where: { commentId: existingReview.commentId },
        data: {
          rating,
          content: content || '',
        },
      });
    } else {
      // Create new review
      await prisma.comments.create({
        data: {
          productId: parseInt(id),
          userId: parseInt(session.user.id),
          rating,
          content: content || '',
        },
      });
    }

    // Update product rating
    const allComments = await prisma.comments.findMany({
      where: { productId: parseInt(id) },
      select: { rating: true },
    });

const averageRating = allComments.length > 0
  ? allComments.reduce((sum: number, comment: { rating: number }) => sum + comment.rating, 0) / allComments.length
  : 0;

    await prisma.products.update({
      where: { productId: parseInt(id) },
      data: { rating: averageRating },
    });

    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[id]/reviews - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find and delete the review
    const review = await prisma.comments.findFirst({
      where: {
        productId: parseInt(id),
        userId: parseInt(session.user.id),
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await prisma.comments.delete({
      where: { commentId: review.commentId },
    });

    // Update product average rating
    const allComments = await prisma.comments.findMany({
      where: { productId: parseInt(id) },
      select: { rating: true },
    });

    const averageRating = allComments.length > 0
      ? allComments.reduce((sum: number, comment: { rating: number }) => sum + comment.rating, 0) / allComments.length
      : 0;

    await prisma.products.update({
      where: { productId: parseInt(id) },
      data: { rating: averageRating },
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
