import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

// GET /api/recipe-favorites - Get user's favorite recipes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.recipeFavorite.findMany({
      where: { userId: session.user.id },
      include: {
        recipe: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching recipe favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe favorites' },
      { status: 500 }
    );
  }
}

// POST /api/recipe-favorites - Add recipe to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Check if already in favorites
    const existingFavorite = await prisma.recipeFavorite.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipeId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Recipe already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = await prisma.recipeFavorite.create({
      data: {
        userId: session.user.id,
        recipeId: recipeId
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding to recipe favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipe-favorites - Remove recipe from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const existingFavorite = await prisma.recipeFavorite.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipeId
        }
      }
    });

    if (!existingFavorite) {
      return NextResponse.json(
        { error: 'Recipe not in favorites' },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.recipeFavorite.delete({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipeId
        }
      }
    });

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
