/**
 * @file Mendefinisikan endpoint API untuk resource brand (/api/brands).
 * Berfungsi sebagai Controller yang menangani request HTTP dan memanggil service layer.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi dari service layer yang baru
import { getAllBrands, createBrand } from '@/lib/api/services/brandServices';

/**
 * Menangani permintaan GET untuk mengambil daftar semua brand.
 * Membutuhkan otentikasi (semua pengguna yang login boleh melihat).
 * @param {Request} request - Objek request masuk.
 * @returns {Promise<NextResponse>} Respons JSON dengan daftar brand atau pesan error.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const brands = await getAllBrands();

    return NextResponse.json({ success: true, data: brands }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/brands:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani permintaan POST untuk membuat brand baru.
 * Membutuhkan otorisasi sebagai admin.
 * @param {Request} request - Objek request masuk dengan body JSON.
 * @returns {Promise<NextResponse>} Respons JSON dengan data brand baru atau pesan error.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const newBrand = await createBrand(data);
    
    // Status 201 Created untuk menandakan resource baru berhasil dibuat.
    return NextResponse.json({ success: true, data: newBrand }, { status: 201 });

  } catch (error) {
    // Memetakan error spesifik dari service ke respons HTTP yang sesuai
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    
    // Fallback untuk error tak terduga
    console.error("Error in POST /api/brands:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
