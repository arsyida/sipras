// Lokasi: /src/app/api/locations/bulk/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import Location from '@/models/Location';

/**
 * Membuat beberapa lokasi baru sekaligus (bulk insert).
 * Menerima payload berupa array of location objects.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk yang berisi body JSON.
 * @returns {Promise<NextResponse>} - Respons JSON berisi pesan sukses atau error.
 */
export async function POST(request) {
  try {
    // 1. Validasi Sesi & Hak Akses Admin
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();

    // 2. Validasi payload: harus berupa array dan tidak kosong
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Payload harus berupa array berisi data lokasi dan tidak boleh kosong.',
      }, { status: 400 });
    }

    // 3. Validasi setiap objek di dalam array (opsional tapi direkomendasikan)
    for (const location of data) {
        if (!location.name || !location.building || !location.floor) {
            return NextResponse.json({
                success: false,
                message: 'Setiap objek lokasi dalam array harus memiliki "name", "building", dan "floor".',
            }, { status: 400 });
        }
    }

    await connectToDatabase();

    // 4. Gunakan insertMany untuk efisiensi.
    // Opsi { ordered: false } akan mencoba memasukkan semua dokumen yang valid,
    // bahkan jika ada beberapa yang gagal (misalnya karena duplikat).
    const createdLocations = await Location.create(data);

    return NextResponse.json({
      success: true,
      message: `${createdLocations.length} lokasi berhasil dibuat.`,
      data: createdLocations
    }, { status: 201 });

  } catch (error) {
    // 5. Penanganan error khusus untuk bulk operations
    if (error.name === 'MongoBulkWriteError' && error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: `Gagal membuat beberapa lokasi karena ada data duplikat. ${error.writeErrors.length} lokasi gagal dimasukkan.`,
        details: error.writeErrors, // Memberikan detail error untuk debugging di frontend
      }, { status: 409 }); // 409 Conflict
    }

    console.error("Error in POST /api/locations/bulk:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
