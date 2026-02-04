import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

// GET /api/addresses - Get all addresses for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressesRaw = await prisma.addresses.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'desc' }
      ]
    });

    // Map IDs for frontend compatibility
    const addresses = addressesRaw.map(addr => ({
      ...addr,
      id: addr.addressId,
    }));

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create a new address
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    if (isDefault) {
      await prisma.addresses.updateMany({
        where: {
          userId: parseInt(session.user.id),
          isDefault: true
        },
        data: {
          isDefault: false,
          
        }
      });
    }

    const address = await prisma.addresses.create({
      data: {
        userId: parseInt(session.user.id),
        fullName,
        phoneNumber,
        region,
        province,
        city,
        barangay,
        streetAddress,
        postalCode,
        landmark: landmark || null,
        isDefault: isDefault || false,
        
      }
    });

    // Map ID for frontend compatibility
    const mappedAddress = { ...address, id: address.addressId };

    return NextResponse.json(mappedAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
