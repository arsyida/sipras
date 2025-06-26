/**
 * @file Mendefinisikan endpoint API untuk resource lokasi (/api/locations).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi dari service layer yang baru
import { 
    getAllLocations, 
    createLocation,
    getPaginatedLocations // Impor fungsi baru
} from '@/lib/api/services/locationServices';

/**
 * Menangani permintaan GET untuk mengambil data lokasi.
 * Mendukung mode 'semua data' dan 'paginasi'.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';

    if (fetchAll) {
      const locations = await getAllLocations();
      return NextResponse.json({ success: true, data: locations }, { status: 200 });
    }

    // --- Logika default untuk paginasi ---
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Panggil service untuk mendapatkan data dengan paginasi
    const { data, totalItems } = await getPaginatedLocations({ page, limit });

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
    console.error("Error in GET /api/locations:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
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
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const newLocation = await createLocation(data);
    
    return NextResponse.json({ success: true, data: newLocation }, { status: 201 });

  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    
    console.error("Error in POST /api/locations:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
