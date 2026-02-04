import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productRaw = await prisma.products.findUnique({
      where: { productId: parseInt(id) },
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
                address: true
              }
            }
          }
        }
      }
    })

    if (!productRaw) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Map IDs for frontend compatibility
    const product = {
      ...productRaw,
      id: String(productRaw.productId),
      users: {
        ...productRaw.users,
        id: String(productRaw.users.userId),
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
