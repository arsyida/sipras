/**
 * @file Mendefinisikan endpoint API untuk resource produk (/api/products).
 * Berfungsi sebagai Controller yang menangani request HTTP dan memanggil service layer.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi dari service layer yang sesuai untuk produk
import {
  createProduct,
  getPaginatedProducts,
  getAllProductsForDropdown
} from '@/lib/api/services/productServices';

/**
 * Menangani permintaan GET untuk mengambil data produk.
 * Mendukung mode 'semua data' dan 'paginasi' dengan filter.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // --- LOGIKA PEMBEDA: Apakah mengambil semua data atau paginasi? ---
    if (searchParams.get("all") === "true") {
      const allProducts = await getAllProductsForDropdown();
      return NextResponse.json(
        { success: true, data: allProducts },
        { status: 200 }
      );
    }
    // ---------------------------------------------------------------

    // --- Logika untuk Paginasi dan Filter ---
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Bangun objek filter dari parameter URL, disesuaikan untuk produk
    const filters = {};
    if (searchParams.get("name"))
      filters.name = { $regex: searchParams.get("name"), $options: "i" };
    if (searchParams.get("brand"))
      filters.brand = searchParams.get("brand");
    if (searchParams.get("category")) 
      filters.category = searchParams.get("category");

    // Panggil backend service dengan filter yang sudah dibuat
    const { data, totalItems } = await getPaginatedProducts({
      page,
      limit,
      filters,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
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
