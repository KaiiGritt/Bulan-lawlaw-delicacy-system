import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/recipes/[id] - Get single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipeRaw = await prisma.recipe.findUnique({
      where: { recipeId: parseInt(id) },
      include: {
        ingredients: { orderBy: { order: 'asc' } },
        instructions: { orderBy: { stepNumber: 'asc' } }
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
      ingredients: recipeRaw.ingredients.map(ing =>
        ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name
      ),
      // Transform instructions to strings: just the instruction text
      instructions: recipeRaw.instructions.map(inst => inst.instruction)
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}
