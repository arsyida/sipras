// Lokasi: /src/app/api/categories/route.js

/**
 * @file Mendefinisikan endpoint API untuk resource kategori (/api/categories).
 * File ini berfungsi sebagai Controller yang menangani request HTTP,
 * memvalidasi otentikasi & otorisasi, memanggil service yang sesuai,
 * dan memformat respons HTTP.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Opsi otentikasi dari NextAuth
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Impor fungsi dari lapisan Service dan Validasi
import { validateAdmin } from '@/lib/api/validate-admin';
import { getPaginatedCategories, getAllCategoriesForDropdown, createCategory } from '@/lib/api/services/categoryServices';

/**
 * Menangani permintaan GET untuk mengambil data kategori.
 * Endpoint ini memiliki dua mode:
 * 1. Mengambil semua kategori (versi sederhana) untuk dropdown jika ada query param `?all=true`.
 * 2. Mengambil kategori dengan paginasi secara default.
 * * Membutuhkan otentikasi (user harus login).
 * * @param {Request} request - Objek request masuk dari Next.js.
 * @returns {Promise<NextResponse>} Promise yang resolve ke objek NextResponse.
 */
export async function GET(request) {
  try {
    // -- OTENTIKASI ---
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // --- ROUTING LOGIKA BISNIS BERDASARKAN QUERY PARAMS ---
    const fetchAll = searchParams.get('all') === 'true';

    if (fetchAll) {
      // Panggil service untuk mendapatkan semua data untuk dropdown
      const categories = await getAllCategoriesForDropdown();
      return NextResponse.json({ success: true, data: categories }, { status: 200 });
    }

    // --- Logika default untuk paginasi ---

    // Ambil dan validasi parameter dari URL, berikan nilai default
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'name'; // Default sort by name
    const order = searchParams.get('order') || 'asc'; // Default order ascending

    // Panggil service untuk mendapatkan data dengan paginasi
    const { data, totalItems } = await getPaginatedCategories({ page, limit, sortBy, order });

    // --- SIAPKAN DAN KIRIM RESPONS SUKSES ---

    // Logika presentasi (perhitungan total halaman) tetap di API layer
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      }
    }, { status: 200 });

  } catch (error) {
    // --- TAHAP 4: PENANGANAN ERROR UMUM ---
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan pada server."
    }, { status: 500 });
  }
}

/**
 * Menangani permintaan POST untuk membuat kategori baru.
 * Endpoint ini dilindungi dan hanya dapat diakses oleh user dengan peran 'admin'.
 * * @param {Request} request - Objek request masuk dari Next.js. Body harus berisi data kategori dalam format JSON.
 * @returns {Promise<NextResponse>} Promise yang resolve ke objek NextResponse.
 */
export async function POST(request) {
  try {
    // OTENTIKASI & OTORISASI ADMIN ---
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      // Kembalikan respons error dari fungsi validasi (bisa 401 atau 403)
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();

    // PANGGIL SERVICE (LOGIKA BISNIS) ---
    const newCategory = await createCategory(data);

    // KIRIM RESPONS SUKSES ---
    // Status 201 Created adalah praktik terbaik untuk respons POST yang berhasil membuat resource baru.
    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });

  } catch (error) {
    // PENANGANAN ERROR SPESIFIK DARI SERVICE ---
    // Menerjemahkan error dari service layer menjadi respons HTTP yang sesuai.
    
    // Jika error karena validasi input (dari Zod di service)
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 }); // 400 Bad Request
    }
    
    // Jika error karena data sudah ada (dari Mongoose di service)
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 }); // 409 Conflict
    }

    // Untuk semua error lainnya yang tidak terduga
    console.error("Unexpected error in POST /api/categories:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 }); // 500 Internal Server Error
  }
}