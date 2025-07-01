/**
 * @file Mendefinisikan endpoint API untuk resource stok barang habis pakai.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Impor fungsi dari service layer
import { getPaginatedConsumableStock } from '@/lib/api/services/consumableServices';

/**
 * Menangani GET untuk mengambil daftar stok barang habis pakai dengan filter dan paginasi.
 * @param {Request} request - Objek request masuk.
 * @returns {Promise<NextResponse>} Respons JSON dengan daftar stok dan metadata paginasi.
 */
export async function GET(request) {
  try {
    // Pengguna yang login boleh melihat daftar stok
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Membangun objek filter secara dinamis
    const filters = {};
    if (searchParams.get('product')) {
      filters.product = searchParams.get('product');
    }
    // Opsi filter tambahan untuk melihat stok yang hampir habis
    if (searchParams.get('low_stock') === 'true') {
        filters.$expr = { $lte: ['$quantity', '$reorder_point'] };
    }

    // Panggil service untuk mendapatkan data
    const { data, totalItems } = await getPaginatedConsumableStock({ page, limit, filters });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: { 
        totalItems, 
        totalPages, 
        currentPage: page, 
        limit 
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/consumables/stock:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
