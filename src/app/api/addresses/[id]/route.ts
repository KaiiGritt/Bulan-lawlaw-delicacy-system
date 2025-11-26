import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/addresses/[id] - Get a specific address
export async function GET(
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
      where: {
        id
      }
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Ensure user can only access their own addresses
    if (address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses/[id] - Update an address
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Ensure user can only update their own addresses
    if (existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      region,
      province,
      city,
      barangay,
      streetAddress,
      postalCode,
      landmark,
      isDefault
    } = body;

    // Validate required fields
    if (!fullName || !phoneNumber || !region || !province || !city ||
        !barangay || !streetAddress || !postalCode) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Validate phone number format (Philippine format)
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s|-/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use format: 09XXXXXXXXX or +639XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Validate postal code (4 digits)
    if (!/^\d{4}$/.test(postalCode)) {
      return NextResponse.json(
        { error: 'Invalid postal code. Must be 4 digits' },
        { status: 400 }
      );
    }

    // If setting as default, remove default from other addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: id }
        },
        data: {
          isDefault: false
        }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        fullName,
        phoneNumber,
        region,
        province,
        city,
        barangay,
        streetAddress,
        postalCode,
        landmark: landmark || null,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete an address
export async function DELETE(
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

    // Ensure user can only delete their own addresses
    if (address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.address.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
