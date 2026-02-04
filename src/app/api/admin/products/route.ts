import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authAdmin';

// Implement proper authentication in app router API route handlers
export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const productsRaw = await prisma.products.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        productId: true,
        name: true,
        image: true,
        category: true,
        price: true,
        stock: true,
        featured: true,
        createdAt: true,
      }
    });

    // Map productId to id for frontend compatibility
    const products = productsRaw.map((product: typeof productsRaw[number]) => ({
      id: String(product.productId),
      name: product.name,
      image: product.image,
      category: product.category,
      price: product.price,
      stock: product.stock,
      featured: product.featured,
      createdAt: product.createdAt,
    }));

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
