// Lokasi: /src/app/api/brands/bulk/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import Brand from '@/models/Brand';

/**
 * Membuat beberapa brand baru sekaligus (bulk insert).
 * Menerima payload berupa array of brand objects.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk yang berisi body JSON.
 * @returns {Promise<NextResponse>} - Respons JSON berisi pesan sukses atau error.
 */
export async function POST(request) {
  try {
    // 1. Validasi Sesi & Hak Akses Admin
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();

    // 2. Validasi payload
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Payload harus berupa array berisi data brand dan tidak boleh kosong.',
      }, { status: 400 });
    }

    // 3. Validasi setiap objek di dalam array
    for (const brand of data) {
        if (!brand.name || brand.name.trim() === '') {
            return NextResponse.json({
                success: false,
                message: 'Setiap objek brand dalam array harus memiliki "name" yang valid.',
            }, { status: 400 });
        }
    }

    await connectToDatabase();

    // --- PERUBAHAN KUNCI DI SINI ---
    // Ganti insertMany() dengan create() untuk memicu timestamps dan middleware lainnya.
    // Metode create() juga bisa menerima array.
    const createdBrands = await Brand.create(data);
    // -------------------------------

    return NextResponse.json({
      success: true,
      message: `${createdBrands.length} brand berhasil dibuat.`,
      data: createdBrands
    }, { status: 201 });

  } catch (error) {
    // Penanganan error untuk duplikasi data (akan dilempar oleh .create())
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: `Gagal membuat brand. Nama '${error.keyValue.name}' sudah ada.`,
      }, { status: 409 }); // 409 Conflict
    }

    console.error("Error in POST /api/brands/bulk:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
