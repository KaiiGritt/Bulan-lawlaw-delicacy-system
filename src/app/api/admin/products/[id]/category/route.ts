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
    const body = await request.json();
    const { category } = body;

    if (typeof category !== 'string') {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { productId: parseInt(id) },
      data: { category },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
