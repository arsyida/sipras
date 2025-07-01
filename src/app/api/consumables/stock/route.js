import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPaginatedConsumableStock } from '@/lib/api/services/consumableServices';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const filters = {};
    if (searchParams.get('product')) filters.product = searchParams.get('product');
    if (searchParams.get('low_stock') === 'true') {
        filters.$expr = { $lte: ['$quantity', '$reorder_point'] };
    }

    const { data, totalItems } = await getPaginatedConsumableStock({ page, limit, filters });
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: { totalItems, totalPages, currentPage: page, limit }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/consumables/stock:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
