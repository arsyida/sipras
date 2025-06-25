// Lokasi: /src/app/api/assets/bulk-by-room/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api';
import { generateLocationBasedSerialNumber } from '@/lib/api/assetService'; // Menggunakan service yang ada
import Asset from '@/models/Asset';
import Product from '@/models/Product';
import mongoose from 'mongoose';

/**
 * Membuat beberapa aset baru sekaligus untuk satu lokasi tertentu.
 * Endpoint ini bisa menangani aset satuan ('Pcs') dan lainnya dalam satu permintaan.
 * @param {Request} request - Objek request masuk yang berisi body JSON.
 * @returns {Promise<NextResponse>} - Respons JSON berisi pesan sukses atau error.
 */
export async function POST(request) {
  // 1. Validasi Sesi & Hak Akses Admin
  const session = await getServerSession(authOptions);
  const validationResponse = validateAdmin(session);
  if (!validationResponse.success) {
    return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
  }

  const dbSession = await mongoose.startSession();
  try {
    const body = await request.json();
    const { locationId, items } = body;

    // 2. Validasi Payload Awal
    if (!locationId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Payload harus berisi "locationId" dan array "items" yang tidak kosong.',
      }, { status: 400 });
    }

    await connectToDatabase();
    
    const createdAssets = [];

    // 3. Memulai Transaksi Database
    await dbSession.withTransaction(async () => {
      // Loop melalui setiap item yang dikirim dari frontend
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) continue; // Lewati jika data item tidak lengkap

        const product = await Product.findById(item.productId).lean();
        if (!product) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
        }

        // Untuk setiap item, buat dokumen sebanyak quantity
        for (let i = 0; i < item.quantity; i++) {
          // Generate serial number yang unik untuk setiap unit
          const serial_number = await generateLocationBasedSerialNumber(item.productId, locationId);
          
          const newAssetData = {
            product: item.productId,
            location: locationId,
            serial_number: serial_number,
            condition: item.condition || 'baik',
            purchase_date: item.purchase_date,
            estimated_price: item.price,
            // Anda bisa tambahkan asset_tag terpisah di sini jika mau
          };
          createdAssets.push(newAssetData);
        }
      }

      if (createdAssets.length > 0) {
        // Masukkan semua dokumen yang sudah disiapkan ke database
        await Asset.insertMany(createdAssets, { session: dbSession });
      }
    });

    await dbSession.endSession();
    
    return NextResponse.json({
      success: true,
      message: `${createdAssets.length} aset berhasil dibuat.`,
    }, { status: 201 });

  } catch (error) {
    await dbSession.endSession();
    console.error("Error in POST /api/assets/bulk-by-room:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
