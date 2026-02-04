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
    const { businessName, businessType, description, contactNumber, address, businessLogo, primaryId, secondaryId } = body

    if (!businessName || !businessType || !description || !contactNumber || !address || !primaryId) {
      return NextResponse.json(
        { error: 'All required fields must be provided (including primary ID)' },
        { status: 400 }
      )
    }

    // Check if user already has an application
    const existingApplication = await prisma.seller_applications.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending application' },
        { status: 400 }
      )
    }

    const application = await prisma.seller_applications.create({
      data: {
        userId: parseInt(session.user.id),
        businessName,
        businessType,
        description,
        contactNumber,
        address,
        businessLogo: businessLogo || null,
        primaryId: primaryId || null,
        secondaryId: secondaryId || null,
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

    const application = await prisma.seller_applications.findUnique({
      where: { userId: parseInt(session.user.id) }
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
    const user = await prisma.users.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: { seller_applications: true }
    })

    if (!user || user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can update business information' },
        { status: 403 }
      )
    }

    if (!user.seller_applications) {
      return NextResponse.json(
        { error: 'No seller application found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { businessName, businessType, description, contactNumber, address, businessLogo, primaryId, secondaryId } = body

    // Validate required fields
    if (!businessName || !businessType || !description || !contactNumber || !address) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Update seller application
    const updatedApplication = await prisma.seller_applications.update({
      where: { userId: parseInt(session.user.id) },
      data: {
        businessName,
        businessType,
        description,
        contactNumber,
        address,
        businessLogo: businessLogo !== undefined ? businessLogo : user.seller_applications.businessLogo,
        primaryId: primaryId !== undefined ? primaryId : user.seller_applications.primaryId,
        secondaryId: secondaryId !== undefined ? secondaryId : user.seller_applications.secondaryId,
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
