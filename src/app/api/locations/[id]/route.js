// Lokasi: /src/app/api/locations/[id]/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api';
import Location from '@/models/Location';
import Asset from '@/models/Asset'; // Impor Asset untuk validasi delete

/**
 * Mengambil detail satu lokasi berdasarkan ID-nya.
 * @param {Request} request - Objek request masuk (tidak digunakan).
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data lokasi atau pesan error.
 */
export async function GET(request, { params }) {
  try {
    // Validasi Sesi (semua pengguna yang login boleh melihat detail)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Gunakan findById untuk mendapatkan satu dokumen, lebih efisien.
    const location = await Location.findById(params.id);

    if (!location) {
      return NextResponse.json({ message: 'Lokasi tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: location }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/locations/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Memperbarui data satu lokasi berdasarkan ID-nya.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk yang berisi body JSON.
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data lokasi yang sudah diperbarui atau pesan error.
 */
export async function PUT(request, { params }) {
  try {
    // Validasi Sesi & Hak Akses Admin
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    await connectToDatabase();

    // Temukan dan perbarui lokasi
    const updatedLocation = await Location.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });

    if (!updatedLocation) {
      return NextResponse.json({ message: 'Lokasi tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedLocation }, { status: 200 });

  } catch (error) {
    console.error("Error in PUT /api/locations/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

/**
 * Menghapus satu lokasi berdasarkan ID-nya.
 * Aksi ini dicegah jika lokasi masih digunakan oleh aset lain.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk.
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi pesan sukses atau error.
 */
export async function DELETE(request, { params }) {
  try {
    // Validasi Sesi & Hak Akses Admin
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    await connectToDatabase();

    // Validasi Kritis: Cek apakah lokasi masih digunakan oleh aset.
    const assetCount = await Asset.countDocuments({ location: params.id });
    if (assetCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Lokasi tidak dapat dihapus karena masih menjadi tempat bagi ${assetCount} aset.`,
      }, { status: 409 }); // 409 Conflict
    }

    const deletedLocation = await Location.findByIdAndDelete(params.id);

    if (!deletedLocation) {
      return NextResponse.json({ message: 'Lokasi tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lokasi berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    console.error("Error in DELETE /api/locations/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
