import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

// GET /api/recipe-favorites - Get user's favorite recipes (saved recipes)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 })
    }

    const userId = parseInt(session.user.id)

    // Get saved recipes as favorites
    const favorites = await prisma.savedRecipe.findMany({
      where: { userId },
      include: {
        recipe: {
          select: {
            recipeId: true,
            title: true,
            description: true,
            image: true,
            prepTime: true,
            cookTime: true,
            servings: true,
            difficulty: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to match expected format
    const transformed = favorites.map(fav => ({
      id: fav.savedRecipeId.toString(),
      recipeId: fav.recipeId.toString(),
      createdAt: fav.createdAt.toISOString(),
      recipe: {
        id: fav.recipe.recipeId.toString(),
        title: fav.recipe.title,
        description: fav.recipe.description,
        image: fav.recipe.image,
        prepTime: fav.recipe.prepTime,
        cookTime: fav.recipe.cookTime,
        servings: fav.recipe.servings,
        difficulty: fav.recipe.difficulty,
      }
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching recipe favorites:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST /api/recipe-favorites - Add a recipe to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: parseInt(recipeId)
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Recipe already in favorites' },
        { status: 400 }
      )
    }

    const favorite = await prisma.savedRecipe.create({
      data: {
        userId,
        recipeId: parseInt(recipeId)
      },
      include: {
        recipe: true
      }
    })

    return NextResponse.json({
      id: favorite.savedRecipeId.toString(),
      recipeId: favorite.recipeId.toString(),
      createdAt: favorite.createdAt.toISOString(),
      recipe: {
        id: favorite.recipe.recipeId.toString(),
        title: favorite.recipe.title,
        description: favorite.recipe.description,
        image: favorite.recipe.image,
        prepTime: favorite.recipe.prepTime,
        cookTime: favorite.recipe.cookTime,
        servings: favorite.recipe.servings,
        difficulty: favorite.recipe.difficulty,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding recipe favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipe-favorites - Remove a recipe from favorites
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    await prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId: parseInt(recipeId)
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing recipe favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
