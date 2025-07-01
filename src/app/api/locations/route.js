/**
 * @file Mendefinisikan endpoint API untuk resource lokasi (/api/locations).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateAdmin } from "@/lib/api/validate-admin";

// Impor fungsi-fungsi dari service layer yang baru
import {
  getPaginatedLocations as getPaginatedLocationsFromService,
  getAllLocationsForDropdown as getAllLocationsFromService,
  createLocation ,
} from "@/lib/api/services/locationServices";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // --- LOGIKA PEMBEDA: Apakah mengambil semua data atau paginasi? ---
    if (searchParams.get("all") === "true") {
      const allLocations = await getAllLocationsFromService();
      return NextResponse.json(
        { success: true, data: allLocations },
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
    if (searchParams.get("building"))
      filters.building = searchParams.get("building");
    if (searchParams.get("floor")) filters.floor = searchParams.get("floor");

    // Panggil backend service dengan filter yang sudah dibuat
    const { data, totalItems } = await getPaginatedLocationsFromService({
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
    console.error("Error in GET /api/locations:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Menangani permintaan POST untuk membuat lokasi baru.
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
    const newLocation = await createLocation(data);

    return NextResponse.json(
      { success: true, data: newLocation },
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

    console.error("Error in POST /api/locations:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
