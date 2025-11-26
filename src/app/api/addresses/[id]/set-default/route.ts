import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// POST /api/addresses/[id]/set-default - Set address as default
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Ensure user can only update their own addresses
    if (address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Remove default from all other addresses
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        isDefault: true
      }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json(
      { error: 'Failed to set default address' },
      { status: 500 }
    );
  }
}
