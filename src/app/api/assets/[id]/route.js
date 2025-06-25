// Lokasi: /src/app/api/assets/[id]/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import Asset from '@/models/Asset';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Location from '@/models/Location';

/**
 * Mengambil detail satu aset berdasarkan ID-nya.
 * Mengisi (populate) data dari Product, Category, dan Location.
 * @param {Request} request - Objek request masuk (tidak digunakan).
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data aset atau pesan error.
 */
export async function GET(request, { params }) {
  try {
    // Validasi Sesi (semua pengguna yang login boleh melihat detail aset)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Gunakan findById dan populate semua data yang diperlukan untuk tampilan detail
    const asset = await Asset.findById(params.id)
      .populate({
        path: 'product',
        model: Product,
        populate: {
          path: 'category',
          model: Category,
          select: 'name'
        }
      })
      .populate({
        path: 'location',
        model: Location
      });

    if (!asset) {
      return NextResponse.json({ message: 'Aset tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/assets/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Memperbarui data satu aset berdasarkan ID-nya.
 * Berguna untuk mutasi (pindah lokasi) atau mengubah kondisi.
 * @param {Request} request - Objek request masuk yang berisi body JSON.
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data aset yang sudah diperbarui atau pesan error.
 */
export async function PUT(request, { params }) {
  try {
    // Aksi ini bisa dilakukan oleh staf (misal: memindahkan aset), jadi tidak perlu validasi admin.
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Temukan dan perbarui aset
    const updatedAsset = await Asset.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });

    if (!updatedAsset) {
      return NextResponse.json({ message: 'Aset tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedAsset }, { status: 200 });

  } catch (error) {
    // Penanganan jika ada duplikasi pada field unik seperti serial_number
    if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyValue)[0];
        return NextResponse.json({
            success: false,
            message: `Gagal memperbarui. ${duplicatedField} '${error.keyValue[duplicatedField]}' sudah ada.`,
        }, { status: 409 });
    }
    console.error("Error in PUT /api/assets/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

/**
 * Menghapus satu aset (penghapusan permanen) berdasarkan ID-nya.
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

    const deletedAsset = await Asset.findByIdAndDelete(params.id);

    if (!deletedAsset) {
      return NextResponse.json({ message: 'Aset tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Aset berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    console.error("Error in DELETE /api/assets/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
