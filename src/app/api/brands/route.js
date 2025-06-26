// Lokasi: /src/app/api/brands/route.js

/**
 * @file Mendefinisikan endpoint API untuk resource brand (/api/brands).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi dari service layer yang baru
import { 
    createBrand,
    getPaginatedBrands,
    getAllBrandsForDropdown
} from '@/lib/api/services/brandServices';

/**
 * Menangani permintaan GET untuk mengambil data brand.
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
      const brands = await getAllBrandsForDropdown();
      return NextResponse.json({ success: true, data: brands }, { status: 200 });
    }

    // --- Logika default untuk paginasi ---
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const nameFilter = searchParams.get('name') || '';

    const { data, totalItems } = await getPaginatedBrands({ 
        page, 
        limit, 
        filters: { name: nameFilter }
    });

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
    console.error("Error in GET /api/brands:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
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
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const newBrand = await createBrand(data);
    
    return NextResponse.json({ success: true, data: newBrand }, { status: 201 });

  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    
    console.error("Error in POST /api/brands:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}