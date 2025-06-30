/**
 * @file Mendefinisikan endpoint API untuk resource aset (/api/assets).
 * Berfungsi sebagai Controller yang menangani request HTTP dan memanggil service layer.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi dari service layer
import { getPaginatedAssets, registerNewAsset } from '@/lib/api/services/assetServices';

/**
 * Menangani GET untuk mengambil daftar aset dengan filter dan paginasi.
 * @param {Request} request - Objek request masuk.
 * @returns {Promise<NextResponse>} Respons JSON dengan daftar aset dan metadata paginasi.
 */
export async function GET(request) {
  try {
    // Pengguna yang login boleh melihat daftar aset, tidak harus admin.
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Membangun objek filter secara dinamis dari query params
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!value) continue; // Lewati filter dengan nilai kosong

      // Filter spesifik untuk pencarian nama aset (tidak ada di skema, jadi ini contoh jika diperlukan)
      // Untuk kasus ini, kita akan filter berdasarkan field yang ada di skema Asset
      if (['location', 'product', 'condition', 'status'].includes(key)) {
        filters[key] = value;
      }
      
      // Catatan: Jika ingin filter berdasarkan nama produk atau serial number,
      // Anda perlu menambahkan logika $regex di sini.
      if (key === 'serial_number') {
        filters.serial_number = { $regex: value, $options: 'i' };
      }
    }
    
    // Panggil service untuk mendapatkan data
    const { data: assets, totalItems } = await getPaginatedAssets({ page, limit, filters });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: { totalItems, totalPages, currentPage: page, limit }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/assets:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani POST untuk mendaftarkan satu aset baru.
 * @param {Request} request - Objek request masuk dengan body JSON.
 * @returns {Promise<NextResponse>} Respons JSON dengan data aset yang baru dibuat.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const newAsset = await registerNewAsset(data);

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });

  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    
    console.error("Error in POST /api/assets:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
