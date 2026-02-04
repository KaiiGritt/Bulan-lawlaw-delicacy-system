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

    const productsRaw = await prisma.products.findMany({
      where: { userId: parseInt(session.user.id) },
      orderBy: { createdAt: 'desc' },
    });

    // Map productId to id for frontend compatibility
    const products = productsRaw.map(product => ({
      ...product,
      id: String(product.productId),
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, category, image, stock } = body;

    if (!name || !description || !price || !category || !image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, category, image' },
        { status: 400 }
      );
    }

    const productRaw = await prisma.products.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        stock: stock ? parseInt(stock) : 0,
        userId: parseInt(session.user.id),
      },
    });

    // Map productId to id for frontend compatibility
    const product = {
      ...productRaw,
      id: String(productRaw.productId),
    };

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
