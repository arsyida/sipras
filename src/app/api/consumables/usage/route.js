// Lokasi: /src/app/api/consumables/usage/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Impor fungsi dari service layer
import { recordUsage } from '@/lib/api/services/consumableServices';

/**
 * Menangani POST untuk mencatat pengambilan stok (barang keluar).
 * @param {Request} request - Objek request masuk.
 * @returns {Promise<NextResponse>} Respons JSON.
 */
export async function POST(request) {
  try {
    // Semua pengguna yang login boleh mencatat pengambilan barang
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Panggil service untuk menjalankan logika bisnis
    const result = await recordUsage(data, session.user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Pengambilan stok berhasil dicatat.',
      data: result
    }, { status: 201 });

  } catch (error) {
    // Menangani error spesifik dari service (misalnya, validasi Zod atau stok tidak cukup)
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }

    // Menangani error umum atau dari logic service itu sendiri
    console.error("Error in POST /api/consumables/usage:", error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
