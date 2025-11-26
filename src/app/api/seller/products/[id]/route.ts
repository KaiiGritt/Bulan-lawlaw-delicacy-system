import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/seller/products/[id] - Get single product
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    const params = await context.params;
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify ownership
    if (product.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this product' }, { status: 403 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/seller/products/[id] - Update product
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    const params = await context.params;
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify ownership
    if (product.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this product' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, category, image, stock } = body;

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(image && { image }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/seller/products/[id] - Delete product
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized. Seller only.' }, { status: 401 });
    }

    const params = await context.params;
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify ownership
    if (product.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this product' }, { status: 403 });
    }

    // Delete the product (cascading deletes will handle cart items, order items, etc.)
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
