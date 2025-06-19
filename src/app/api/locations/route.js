// Lokasi: /src/app/api/locations/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api';
import Location from '@/models/Location';

/**
 * Mengambil daftar semua lokasi.
 * Diurutkan berdasarkan gedung, lantai, dan nama.
 * @param {Request} request - Objek request masuk (tidak digunakan).
 * @returns {Promise<NextResponse>} - Respons JSON berisi array data lokasi atau pesan error.
 */
export async function GET(request) {
  try {
    // Validasi Sesi (semua pengguna yang login boleh melihat daftar lokasi)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Ambil semua lokasi dan urutkan
    const locations = await Location.find({}).sort({ building: 1, floor: 1, name: 1 });

    // Respons yang lebih baik jika tidak ada data ditemukan
    if (!locations || locations.length === 0) {
      return NextResponse.json({ success: true, data: [], message: "Tidak ada lokasi ditemukan." }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: locations }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/locations:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Membuat lokasi baru.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk yang berisi body JSON dengan data lokasi.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data lokasi yang baru dibuat atau pesan error.
 */
export async function POST(request) {
  try {
    // Validasi Sesi & Hak Akses Admin
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();

    // Validasi input dasar
    if (!data.name || !data.building || !data.floor) {
        return NextResponse.json({ success: false, message: "Nama, Gedung, dan Lantai tidak boleh kosong." }, { status: 400 });
    }

    await connectToDatabase();

    // Buat dokumen baru di database
    const newLocation = await Location.create(data);

    if (!newLocation) {
        return NextResponse.json({ success: false, message: "Gagal membuat lokasi di database." }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: newLocation }, { status: 201 });

  } catch (error) {
    // Penanganan error untuk duplikasi data berdasarkan index unik
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat lokasi. Kombinasi Nama, Gedung, dan Lantai sudah ada.',
      }, { status: 409 }); // 409 Conflict
    }
    console.error("Error in POST /api/locations:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
