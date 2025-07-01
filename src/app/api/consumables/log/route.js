// Lokasi: /src/app/api/consumables/log/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Impor fungsi dari service layer
import { getPaginatedConsumableLogs } from '@/lib/api/services/consumableServices';

/**
 * Menangani GET untuk mengambil riwayat transaksi barang habis pakai.
 * @param {Request} request - Objek request masuk.
 * @returns {Promise<NextResponse>} Respons JSON dengan daftar log dan metadata paginasi.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Bangun objek filter dari parameter URL
    const filters = {};
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Jika kedua tanggal ada, buat filter rentang waktu
    if (startDate && endDate) {
        filters.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    // Panggil service untuk mendapatkan data
    const { data, totalItems } = await getPaginatedConsumableLogs({ 
      page, 
      limit, 
      filters 
    });

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
    console.error("Error in GET /api/consumables/log:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
