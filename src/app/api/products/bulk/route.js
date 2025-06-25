/**
 * @file Mendefinisikan endpoint API untuk operasi bulk create pada produk (/api/products/bulk).
 * Endpoint ini hanya mendukung metode POST.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi service yang baru dibuat
import { createBulkProducts } from '@/lib/api/services/productServices';

/**
 * Menangani POST untuk membuat beberapa produk sekaligus (bulk insert).
 * Menerima payload berupa array of product objects.
 * Membutuhkan otorisasi sebagai admin.
 * @param {Request} request - Objek request masuk dengan body JSON berisi array produk.
 * @returns {Promise<NextResponse>} Respons JSON yang mengindikasikan hasil operasi.
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

    // 2. Panggil service untuk melakukan logika bisnis
    const result = await createBulkProducts(data);

    // 3. Kirim respons sukses jika operasi berhasil
    return NextResponse.json({
      success: true,
      message: `${result.count} produk berhasil dibuat.`,
      data: result.createdProducts
    }, { status: 201 });

  } catch (error) {
    // 4. Penanganan error spesifik yang dilempar dari service layer
    if (error.isValidationError) {
      return NextResponse.json({
        success: false,
        message: error.message,
        errors: error.errors // Optional: sertakan detail error dari Zod
      }, { status: 400 }); // 400 Bad Request
    }

    if (error.isBulkWriteError) {
      return NextResponse.json({
        success: false,
        message: error.message,
        details: error.details,
      }, { status: 409 }); // 409 Conflict
    }

    // 5. Fallback untuk semua error tak terduga lainnya
    console.error("Error in POST /api/products/bulk:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
