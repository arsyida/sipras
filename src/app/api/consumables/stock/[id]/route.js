/**
 * @file Mendefinisikan endpoint API untuk satu resource stok barang habis pakai spesifik.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getConsumableStockById } from '@/lib/api/services/consumableServices';

/**
 * Menangani GET untuk mengambil detail satu item stok.
 */
export async function GET(request, { params }) {
  const {id} = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const stockItem = await getConsumableStockById(id);
    return NextResponse.json({ success: true, data: stockItem }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
        return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error(`Error in GET /api/consumables/stock/${params.id}:`, error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
