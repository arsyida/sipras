// Lokasi file: /src/app/api/assets/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Asset from '@/models/Asset';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// Impor model yang direferensikan agar Mongoose tahu cara melakukan populate
import Product from '@/models/Product';
import Location from '@/models/Location';
import Category from '@/models/Category'; // Diperlukan untuk populate bersarang

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // --- PERUBAHAN DI SINI ---
    const assets = await Asset.find({})
      // 1. Ambil data lengkap untuk field 'product'
      .populate({
        path: 'product',
        model: Product,
        // Anda bahkan bisa melakukan populate di dalam populate!
        // Ambil juga data kategori dari produk.
        populate: {
          path: 'category',
          model: Category,
          select: 'name' // Hanya ambil nama kategori
        }
      })
      // 2. Ambil data lengkap untuk field 'location'
      .populate({
        path: 'location',
        model: Location,
        select: 'name building floor' // Hanya ambil field yang dibutuhkan
      })
      .sort({ createdAt: -1 }); // Urutkan berdasarkan yang terbaru
    // -------------------------

    return NextResponse.json({ success: true, data: assets }, { status: 200 });
  } catch (error) {
    console.error(error); // Tampilkan error di log server untuk debugging
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
