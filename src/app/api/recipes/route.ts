import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

// GET /api/recipes - Get all recipes
export async function GET() {
  try {
    const recipesRaw = await prisma.recipes.findMany({
      orderBy: { createdAt: 'desc' },
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
    })

    // Map recipeId to id for frontend compatibility
    type RecipeType = typeof recipesRaw[number];
    type IngType = RecipeType['recipe_ingredients'][number];
    type InstType = RecipeType['recipe_instructions'][number];
    const recipes = recipesRaw.map((recipe: RecipeType) => ({
      ...recipe,
      id: String(recipe.recipeId),
      recipe_ingredients: recipe.recipe_ingredients.map((ing: IngType) => ({
        ...ing,
        id: ing.ingredientId,
      })),
      recipe_instructions: recipe.recipe_instructions.map((inst: InstType) => ({
        ...inst,
        id: inst.instructionId,
      }))
    }))

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create a new recipe (admin, user, and seller)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['admin', 'user', 'seller'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, ingredients, instructions, image, prepTime, cookTime, servings, difficulty } = body

    if (!title || !description || !ingredients || !instructions || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const recipeRaw = await prisma.recipes.create({
      data: {
        title,
        description,
        image,
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        servings: parseInt(servings),
        difficulty,
        userId: parseInt(session.user.id),
        recipe_ingredients: {
          create: ingredients.map((ing: { name: string; quantity?: string }, index: number) => ({
            name: ing.name,
            quantity: ing.quantity,
            order: index
          }))
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
    })

    // Map recipeId to id for frontend compatibility
    const recipe = {
      ...recipeRaw,
      id: String(recipeRaw.recipeId),
      recipe_ingredients: recipeRaw.recipe_ingredients.map((ing: typeof recipeRaw.recipe_ingredients[number]) => ({
        ...ing,
        id: ing.ingredientId,
      })),
      recipe_instructions: recipeRaw.recipe_instructions.map((inst: typeof recipeRaw.recipe_instructions[number]) => ({
        ...inst,
        id: inst.instructionId,
      }))
    }

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error('Error creating recipes:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
