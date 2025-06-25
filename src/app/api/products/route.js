/**
 * @file Mendefinisikan endpoint API untuk resource produk (/api/products).
 * Berfungsi sebagai Controller yang menangani request HTTP dan memanggil service layer.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi dari service layer yang baru
import {
  createProduct,
  getPaginatedProducts,
  getAllProductsForDropdown
} from '@/lib/api/services/productServices';

/**
 * Menangani permintaan GET untuk mengambil data produk.
 * Endpoint ini memiliki dua mode:
 * 1. Mengambil semua produk (versi sederhana) untuk dropdown jika ada query param `?all=true`.
 * 2. Mengambil produk dengan paginasi secara default.
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
      const products = await getAllProductsForDropdown();
      return NextResponse.json({ success: true, data: products }, { status: 200 });
    }

    // --- Logika default untuk paginasi ---

    // Ambil dan validasi parameter dari URL, berikan nilai default
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'name'; // Default sort by name
    const order = searchParams.get('order') || 'asc'; // Default order ascending

    // Panggil service untuk mendapatkan data dengan paginasi
    const { data, totalItems } = await getPaginatedProducts({ page, limit, sortBy, order });

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
 * Menangani permintaan POST untuk membuat produk baru.
 * @param {Request} request - Objek request masuk dengan body JSON.
 * @returns {Promise<NextResponse>} Respons JSON dengan data produk baru.
 */
export async function POST(request) {
  try {
    // --- OTENTIKASI & OTORISASI ADMIN ---
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();

    // --- PANGGIL SERVICE (LOGIKA BISNIS) ---
    const newProduct = await createProduct(data);

    // --- KIRIM RESPONS SUKSES ---
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });

  } catch (error) {
    // --- PENANGANAN ERROR SPESIFIK DARI SERVICE ---
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }

    // Untuk semua error lainnya yang tidak terduga
    console.error("Error in POST /api/products:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}