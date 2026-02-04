import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/recipes/[id] - Get single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipeRaw = await prisma.recipes.findUnique({
      where: { recipeId: parseInt(id) },
      include: {
        recipe_ingredients: { orderBy: { order: 'asc' } },
        recipe_instructions: { orderBy: { stepNumber: 'asc' } },
        users: {
          select: {
            userId: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    if (!recipeRaw) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Transform to frontend-compatible format
    const recipe = {
      id: String(recipeRaw.recipeId),
      userId: recipeRaw.userId,
      user: recipeRaw.users,
      title: recipeRaw.title,
      description: recipeRaw.description,
      image: recipeRaw.image,
      prepTime: recipeRaw.prepTime,
      cookTime: recipeRaw.cookTime,
      servings: recipeRaw.servings,
      difficulty: recipeRaw.difficulty,
      rating: recipeRaw.rating,
      createdAt: recipeRaw.createdAt,
      // Transform ingredients to strings: "quantity name" or just "name"
      recipe_ingredients: recipeRaw.recipe_ingredients.map(ing =>
        ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name
      ),
      // Transform instructions to strings: just the instruction text
      recipe_instructions: recipeRaw.recipe_instructions.map(inst => inst.instruction)
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update a recipe (owner or admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recipeId = parseInt(id);

    // Check if recipe exists and user is owner or admin
    const existingRecipe = await prisma.recipes.findUnique({
      where: { recipeId }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const isOwner = existingRecipe.userId === parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to edit this recipe' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, ingredients, instructions, image, prepTime, cookTime, servings, difficulty } = body;

    // Delete existing ingredients and instructions
    await prisma.recipe_ingredients.deleteMany({ where: { recipeId } });
    await prisma.recipe_instructions.deleteMany({ where: { recipeId } });

    // Update recipe with new data
    const recipeRaw = await prisma.recipes.update({
      where: { recipeId },
      data: {
        title,
        description,
        image,
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        servings: parseInt(servings),
        difficulty,
        recipe_ingredients: {
          create: ingredients.map((ing: { name: string; quantity?: string } | string, index: number) => {
            if (typeof ing === 'string') {
              // Parse "quantity name" format
              const parts = ing.match(/^([\d.\/]+\s*\w*)\s+(.+)$/);
              if (parts) {
                return { name: parts[2], quantity: parts[1], order: index };
              }
              return { name: ing, quantity: null, order: index };
            }
            return { name: ing.name, quantity: ing.quantity, order: index };
          })
        },
        recipe_instructions: {
          create: instructions.map((inst: string, index: number) => ({
            stepNumber: index + 1,
            instruction: inst
          }))
        }
      },
      include: {
        recipe_ingredients: { orderBy: { order: 'asc' } },
        recipe_instructions: { orderBy: { stepNumber: 'asc' } },
        users: {
          select: {
            userId: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    const recipe = {
      ...recipeRaw,
      id: String(recipeRaw.recipeId)
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error updating recipes:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete a recipe (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recipeId = parseInt(id);

    // Check if recipe exists and user is owner or admin
    const existingRecipe = await prisma.recipes.findUnique({
      where: { recipeId }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const isOwner = existingRecipe.userId === parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 }
      );
    }

    await prisma.recipes.delete({
      where: { recipeId }
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipes:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
