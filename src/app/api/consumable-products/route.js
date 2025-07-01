/**
 * @file Mendefinisikan endpoint API untuk resource produk habis pakai.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import { 
    createConsumableProduct,
    getPaginatedConsumableProducts,
    getAllConsumableProductsForDropdown
} from '@/lib/api/services/consumableServices';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get("all") === "true") {
      const products = await getAllConsumableProductsForDropdown();
      return NextResponse.json({ success: true, data: products }, { status: 200 });
    }

    const page = parseInt(searchParams.get("page") || '1', 10);
    const limit = parseInt(searchParams.get("limit") || '10', 10);
    const filters = {};
    if (searchParams.get("name")) {
      filters.name = { $regex: searchParams.get("name"), $options: "i" };
    }
    if (searchParams.get("category")) {
      filters.category = searchParams.get("category");
    }

    const { data, totalItems } = await getPaginatedConsumableProducts({ page, limit, filters });
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: { currentPage: page, totalPages, totalItems, limit },
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/consumable-products:", error);
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
    const newProduct = await createConsumableProduct(data);
    
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });

  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    console.error("Error in POST /api/consumable-products:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
