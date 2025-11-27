import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
// POST /api/seller-application - Submit seller application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { businessName, businessType, description, contactNumber, address } = body

    if (!businessName || !businessType || !description || !contactNumber || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already has an application
    const existingApplication = await prisma.sellerApplication.findUnique({
      where: { userId: session.user.id }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending application' },
        { status: 400 }
      )
    }

    const application = await prisma.sellerApplication.create({
      data: {
        userId: session.user.id,
        businessName,
        businessType,
        description,
        contactNumber,
        address,
      }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating seller application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// GET /api/seller-application - Get user's seller application status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { userId: session.user.id }
    })

    if (!application) {
      return NextResponse.json({ hasApplication: false })
    }

    return NextResponse.json({
      hasApplication: true,
      application
    })
  } catch (error) {
    console.error('Error fetching seller application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

// PUT /api/seller-application - Update seller business information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerApplication: true }
    })

    if (!user || user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can update business information' },
        { status: 403 }
      )
    }

    if (!user.sellerApplication) {
      return NextResponse.json(
        { error: 'No seller application found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { businessName, businessType, description, contactNumber, address, businessLogo } = body

    // Validate required fields
    if (!businessName || !businessType || !description || !contactNumber || !address) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Update seller application
    const updatedApplication = await prisma.sellerApplication.update({
      where: { userId: session.user.id },
      data: {
        businessName,
        businessType,
        description,
        contactNumber,
        address,
        businessLogo: businessLogo || user.sellerApplication.businessLogo,
      }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating seller application:', error)
    return NextResponse.json(
      { error: 'Failed to update business information' },
      { status: 500 }
    )
  }
}
