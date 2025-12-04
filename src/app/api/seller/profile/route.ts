import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    const sellerApplication = await prisma.sellerApplication.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!sellerApplication) {
      return NextResponse.json({ error: 'Seller profile not found.' }, { status: 404 });
    }

    return NextResponse.json(sellerApplication);
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    const body = await req.json();
    const { businessName, businessType, description, contactNumber, address } = body;

    const updatedProfile = await prisma.sellerApplication.update({
      where: { userId: parseInt(session.user.id) },
      data: {
        businessName,
        businessType,
        description,
        contactNumber,
        address,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
