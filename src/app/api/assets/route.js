// Lokasi: /src/app/api/assets/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import { generateAssetTag } from '@/lib/api/assets/generateAssetTag'; // Impor fungsi helper
import Asset from '@/models/Asset';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Location from '@/models/Location';

/**
 * Mengambil daftar semua aset dengan filter, sorting, dan pagination.
 * @param {Request} request - Objek request masuk yang bisa berisi URL search params.
 * @returns {Promise<NextResponse>} - Respons JSON berisi array data aset dan metadata pagination.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Bangun objek filter dari searchParams
    const filters = {};
    if (searchParams.get('location')) filters.location = searchParams.get('location');
    if (searchParams.get('product')) filters.product = searchParams.get('product');
    if (searchParams.get('condition')) filters.condition = searchParams.get('condition');
    if (searchParams.get('status')) filters.status = searchParams.get('status');

    await connectToDatabase();

    const skip = (page - 1) * limit;

    const [assets, totalAssets] = await Promise.all([
      Asset.find(filters)
        .populate({
          path: 'product',
          model: Product,
          populate: { path: 'category', model: Category, select: 'name' }
        })
        .populate({
          path: 'location',
          model: Location,
          select: 'name building'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Asset.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalAssets / limit);

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: { totalAssets, totalPages, currentPage: page, limit }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/assets:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Mendaftarkan satu aset baru secara individual.
 * Asset Tag akan dibuat secara otomatis.
 * @param {Request} request - Objek request masuk yang berisi body JSON dengan data aset.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data aset yang baru dibuat.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    // Memerlukan hak akses admin untuk mendaftarkan aset baru
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const { product: productId, ...otherData } = data;

    if (!productId) {
      return NextResponse.json({ success: false, message: "Produk wajib dipilih." }, { status: 400 });
    }

    await connectToDatabase();

    // Buat asset_tag unik secara otomatis menggunakan helper function
    const serial_number = await generateAssetTag(productId);

    const newAsset = await Asset.create({
      ...otherData,
      product: productId,
      serial_number: serial_number,
    });

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });

  } catch (error) {
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      return NextResponse.json({
        success: false,
        message: `Gagal membuat aset. ${duplicatedField} '${error.keyValue[duplicatedField]}' sudah ada.`,
      }, { status: 409 });
    }
    console.error("Error in POST /api/assets:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
