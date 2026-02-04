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
    const favorites = await prisma.saved_recipes.findMany({
      where: { userId },
      include: {
        recipes: {
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
      recipes: {
        id: fav.recipes.recipeId.toString(),
        title: fav.recipes.title,
        description: fav.recipes.description,
        image: fav.recipes.image,
        prepTime: fav.recipes.prepTime,
        cookTime: fav.recipes.cookTime,
        servings: fav.recipes.servings,
        difficulty: fav.recipes.difficulty,
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
    const existing = await prisma.saved_recipes.findUnique({
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

    const favorite = await prisma.saved_recipes.create({
      data: {
        userId,
        recipeId: parseInt(recipeId)
      },
      include: {
        recipes: true
      }
    })

    return NextResponse.json({
      id: favorite.savedRecipeId.toString(),
      recipeId: favorite.recipeId.toString(),
      createdAt: favorite.createdAt.toISOString(),
      recipes: {
        id: favorite.recipes.recipeId.toString(),
        title: favorite.recipes.title,
        description: favorite.recipes.description,
        image: favorite.recipes.image,
        prepTime: favorite.recipes.prepTime,
        cookTime: favorite.recipes.cookTime,
        servings: favorite.recipes.servings,
        difficulty: favorite.recipes.difficulty,
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

    await prisma.saved_recipes.delete({
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
