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

    const savedRecipesRaw = await prisma.saved_recipes.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        recipes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map IDs for frontend compatibility
    const savedRecipes = savedRecipesRaw.map((saved: typeof savedRecipesRaw[number]) => ({
      ...saved,
      id: String(saved.savedRecipeId),
      recipeId: String(saved.recipeId),
      recipes: {
        ...saved.recipes,
        id: String(saved.recipes.recipeId),
      }
    }));

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

    const recipeIdInt = parseInt(recipeId);

    // Check if recipe exists
    const recipe = await prisma.recipes.findUnique({
      where: { recipeId: recipeIdInt }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSaved = await prisma.saved_recipes.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: recipeIdInt
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
    const savedRecipe = await prisma.saved_recipes.create({
      data: {
        userId: parseInt(session.user.id),
        recipeId: recipeIdInt,
        notes: notes || null
      },
      include: {
        recipes: true
      }
    });

    return NextResponse.json(savedRecipe, { status: 201 });
  } catch (error) {
    console.error('Error saving recipes:', error);
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

    const recipeIdInt = parseInt(recipeId);

    // Check if saved recipe exists
    const existingSaved = await prisma.saved_recipes.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: recipeIdInt
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
    const updatedSaved = await prisma.saved_recipes.update({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: recipeIdInt
        }
      },
      data: {
        notes: notes || null
      },
      include: {
        recipes: true
      }
    });

    return NextResponse.json(updatedSaved);
  } catch (error) {
    console.error('Error updating saved recipes:', error);
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
    const existingSaved = await prisma.saved_recipes.findUnique({
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
    await prisma.saved_recipes.delete({
      where: {
        userId_recipeId: {
          userId: parseInt(session.user.id),
          recipeId: parseInt(recipeId)
        }
      }
    });

    return NextResponse.json({ message: 'Removed saved recipe' });
  } catch (error) {
    console.error('Error removing saved recipes:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved recipe' },
      { status: 500 }
    );
  }
}
