import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';

// GET /api/recipes/[id]/reviews - Get all reviews for a recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviewsRaw = await prisma.recipeReview.findMany({
      where: { recipeId: parseInt(id) },
      include: {
        user: {
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
      id: review.reviewId,
      user: {
        ...review.user,
        id: String(review.user.userId),
      }
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recipes/[id]/reviews - Submit or update a review
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

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { recipeId: parseInt(id) },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if user already reviewed this recipe
    const existingReview = await prisma.recipeReview.findUnique({
      where: {
        recipeId_userId: {
          recipeId: parseInt(id),
          userId: parseInt(session.user.id),
        }
      },
    });

    if (existingReview) {
      // Update existing review
      await prisma.recipeReview.update({
        where: { reviewId: existingReview.reviewId },
        data: {
          rating,
          content: content || '',
        },
      });
    } else {
      // Create new review
      await prisma.recipeReview.create({
        data: {
          recipeId: parseInt(id),
          userId: parseInt(session.user.id),
          rating,
          content: content || '',
        },
      });
    }

    // Update recipe average rating
    const allReviews = await prisma.recipeReview.findMany({
      where: { recipeId: parseInt(id) },
      select: { rating: true },
    });

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0;

    await prisma.recipe.update({
      where: { recipeId: parseInt(id) },
      data: { rating: averageRating },
    });

    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/recipes/[id]/reviews - Delete a review
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
    const review = await prisma.recipeReview.findUnique({
      where: {
        recipeId_userId: {
          recipeId: parseInt(id),
          userId: parseInt(session.user.id),
        }
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await prisma.recipeReview.delete({
      where: { reviewId: review.reviewId },
    });

    // Update recipe average rating
    const allReviews = await prisma.recipeReview.findMany({
      where: { recipeId: parseInt(id) },
      select: { rating: true },
    });

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0;

    await prisma.recipe.update({
      where: { recipeId: parseInt(id) },
      data: { rating: averageRating },
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
