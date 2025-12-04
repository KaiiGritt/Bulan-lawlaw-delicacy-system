import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

// GET /api/saved-recipes - Get user's saved recipes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedRecipes = await prisma.savedRecipe.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        recipe: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(savedRecipes);
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved recipes' },
      { status: 500 }
    );
  }
}

// POST /api/saved-recipes - Save a recipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId, notes } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { recipeId: recipeId }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSaved = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: recipeId
        }
      }
    });

    if (existingSaved) {
      return NextResponse.json(
        { error: 'Recipe already saved' },
        { status: 400 }
      );
    }

    // Save recipe
    const savedRecipe = await prisma.savedRecipe.create({
      data: {
        userId: parseInt(session.user.id),
        recipeId: recipeId,
        notes: notes || null
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json(savedRecipe, { status: 201 });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}

// PUT /api/saved-recipes - Update saved recipe notes
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId, notes } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if saved recipe exists
    const existingSaved = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: recipeId
        }
      }
    });

    if (!existingSaved) {
      return NextResponse.json(
        { error: 'Recipe not saved' },
        { status: 404 }
      );
    }

    // Update notes
    const updatedSaved = await prisma.savedRecipe.update({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: recipeId
        }
      },
      data: {
        notes: notes || null
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json(updatedSaved);
  } catch (error) {
    console.error('Error updating saved recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update saved recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-recipes - Remove saved recipe
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

    // Check if saved recipe exists
    const existingSaved = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: parseInt(recipeId)
        }
      }
    });

    if (!existingSaved) {
      return NextResponse.json(
        { error: 'Recipe not saved' },
        { status: 404 }
      );
    }

    // Remove saved recipe
    await prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: parseInt(recipeId)
        }
      }
    });

    return NextResponse.json({ message: 'Removed saved recipe' });
  } catch (error) {
    console.error('Error removing saved recipe:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved recipe' },
      { status: 500 }
    );
  }
}
