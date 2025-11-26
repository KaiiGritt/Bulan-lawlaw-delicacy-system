import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authAdmin';

// Implement proper authentication in app router API route handlers
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Unwrap params promise before accessing id
  const { params } = context;
  const { id } = await params;

  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    // Get current featured value with ensured typing
    const product = await prisma.product.findUnique({
      where: { id },
      select: { featured: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Toggle featured boolean
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { featured: !product.featured },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle featured status' }, { status: 500 });
  }
}
