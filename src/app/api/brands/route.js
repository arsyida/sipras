/**
 * @file Mendefinisikan endpoint API untuk resource brand (/api/brands).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateAdmin } from "@/lib/api/validate-admin";

// Impor fungsi-fungsi dari service layer yang baru
import {
  createBrand,
  getPaginatedBrands,
  getAllBrandsForDropdown,
} from "@/lib/api/services/brandServices";

/**
 * Menangani permintaan GET untuk mengambil data brand.
 * Mendukung mode 'semua data' dan 'paginasi'.
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
      const allBrands = await getAllBrandsForDropdown();
      return NextResponse.json(
        { success: true, data: allBrands },
        { status: 200 }
      );
    }
    // ---------------------------------------------------------------

    // --- Logika untuk Paginasi dan Filter ---
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Bangun objek filter dari parameter URL
    const filters = {};
    if (searchParams.get("name"))
      filters.name = { $regex: searchParams.get("name"), $options: "i" };

    // Panggil backend service dengan filter yang sudah dibuat
    const { data, totalItems } = await getPaginatedBrands({
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
    console.error("Error in GET /api/brands:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Menangani permintaan POST untuk membuat brand baru.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json(
        { message: validationResponse.message },
        { status: validationResponse.status }
      );
    }

    const data = await request.json();
    const newBrand = await createBrand(data);

    return NextResponse.json(
      { success: true, data: newBrand },
      { status: 201 }
    );
  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    if (error.isDuplicate) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    console.error("Error in POST /api/brands:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
