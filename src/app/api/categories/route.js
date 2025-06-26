// Lokasi: /src/app/api/kategori/route.js

/**
 * @file Mendefinisikan endpoint API untuk resource kategori (/api/kategori).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import { 
    createCategory,
    getPaginatedCategories,
    getAllCategoriesForDropdown
} from '@/lib/api/services/categoryServices';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';

    if (fetchAll) {
      const categories = await getAllCategoriesForDropdown();
      return NextResponse.json({ success: true, data: categories }, { status: 200 });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const nameFilter = searchParams.get('name') || '';

    const { data, totalItems } = await getPaginatedCategories({ 
        page, 
        limit, 
        filters: { name: nameFilter }
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: { currentPage: page, totalPages, totalItems }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/kategori:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const newCategory = await createCategory(data);
    
    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });

  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    console.error("Error in POST /api/kategori:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}