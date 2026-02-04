import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

// GET /api/products - Get all products
export async function GET() {
  try {
    const productsRaw = await prisma.products.findMany({
      include: {
        users: {
          select: {
            userId: true,
            name: true,
            email: true,
            seller_applications: {
              select: {
                businessName: true,
                businessLogo: true,
                description: true,
                businessType: true,
                contactNumber: true,
                address: true
              }
            }
          }
        },
        comments: {
          select: {
            commentId: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map productId to id for frontend compatibility
    const products = productsRaw.map(product => ({
      ...product,
      id: String(product.productId),
      users: {
        ...product.users,
        id: String(product.users.userId),
      },
      comments: product.comments.map(comment => ({
        ...comment,
        id: comment.commentId,
      }))
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, price, category, image, stock, userId } = body

    if (!name || !description || !price || !category || !image || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const productRaw = await prisma.products.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        stock: stock ? parseInt(stock) : 0,
        userId
      }
    })

    // Map productId to id for frontend compatibility
    const product = {
      ...productRaw,
      id: String(productRaw.productId),
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
