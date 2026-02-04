import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authAdmin';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    // Delete the product
    const product = await prisma.products.delete({
      where: { productId: parseInt(id) },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove product' }, { status: 500 });
  }
}
