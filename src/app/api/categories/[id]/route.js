// Lokasi: /src/app/api/categories/[id]/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api';
import Category from '@/models/Category';
import Product from '@/models/Product'; // Impor Product untuk validasi delete

/**
 * Mengambil detail satu kategori berdasarkan ID-nya.
 * @param {Request} request - Objek request masuk (tidak digunakan di sini).
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data kategori atau pesan error.
 */
export async function GET(request, { params }) {
  try {
    // Validasi Sesi & Hak Akses (Staf biasa boleh melihat detail)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Gunakan findById untuk mendapatkan satu dokumen, lebih efisien daripada find.
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/categories/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Memperbarui data satu kategori berdasarkan ID-nya.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk yang berisi body JSON.
 * @param {{ params: { id: string } }} context - Konteks berisi parameter dinamis dari URL.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data kategori yang sudah diperbarui atau pesan error.
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

    // Temukan dan perbarui kategori
    // { new: true } memastikan metode ini mengembalikan dokumen yang sudah diperbarui.
    const updatedCategory = await Category.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });

    if (!updatedCategory) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCategory }, { status: 200 });

  } catch (error) {
    console.error("Error in PUT /api/categories/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

/**
 * Menghapus satu kategori berdasarkan ID-nya.
 * Aksi ini dicegah jika kategori masih digunakan oleh produk lain.
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

    // --- Validasi Penting: Cek apakah kategori masih digunakan ---
    const productCount = await Product.countDocuments({ category: params.id });
    if (productCount > 0) {
      // 409 Conflict: Permintaan tidak dapat diselesaikan karena konflik dengan state saat ini.
      return NextResponse.json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${productCount} produk.`,
      }, { status: 409 });
    }
    // -----------------------------------------------------------

    const deletedCategory = await Category.findByIdAndDelete(params.id);

    if (!deletedCategory) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    console.error("Error in DELETE /api/categories/[id]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
