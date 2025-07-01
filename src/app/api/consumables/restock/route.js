// Lokasi: /src/app/api/consumables/restock/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi dari service layer
import { recordRestock } from '@/lib/api/services/consumableServices';

/**
 * Menangani POST untuk mencatat penambahan stok (barang masuk).
 * @param {Request} request - Objek request masuk.
 * @returns {Promise<NextResponse>} Respons JSON.
 */
export async function POST(request) {
  try {
    // Hanya admin yang boleh menambah stok
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    
    // Panggil service untuk menjalankan logika bisnis
    const result = await recordRestock(data, session.user.id);
    return NextResponse.json({
      success: true,
      message: 'Stok berhasil ditambahkan.',
      data: result
    }, { status: 201 });

  } catch (error) {
    // Menangani error spesifik dari service (misalnya, validasi Zod)
    if (error.isValidationError) {
        return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }

    console.error("Error in POST /api/consumables/restock:", error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
