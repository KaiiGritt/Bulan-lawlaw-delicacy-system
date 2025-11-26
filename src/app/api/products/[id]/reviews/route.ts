import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';

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
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.comment.findFirst({
      where: {
        productId: id,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      // Update existing review
      await prisma.comment.update({
        where: { id: existingReview.id },
        data: {
          rating,
          content: content || '',
        },
      });
    } else {
      // Create new review
      await prisma.comment.create({
        data: {
          productId: id,
          userId: session.user.id,
          rating,
          content: content || '',
        },
      });
    }

    // Update product rating
    const allComments = await prisma.comment.findMany({
      where: { productId: id },
      select: { rating: true },
    });

const averageRating = allComments.length > 0
  ? allComments.reduce((sum: number, comment: { rating: number }) => sum + comment.rating, 0) / allComments.length
  : 0;

    await prisma.product.update({
      where: { id },
      data: { rating: averageRating },
    });

    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
