// Lokasi: /src/app/api/categories/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api';
import Category from '@/models/Category';

/**
 * Mengambil daftar semua kategori.
 * Diurutkan berdasarkan nama secara ascending.
 * @param {Request} request - Objek request masuk (tidak digunakan).
 * @returns {Promise<NextResponse>} - Respons JSON berisi array data kategori atau pesan error.
 */
export async function GET(request) {
  try {
    // Validasi Sesi (semua pengguna yang login boleh melihat daftar kategori)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Ambil semua kategori dan urutkan berdasarkan nama
    const categories = await Category.find({}).sort({ name: 1 });

    // Tambahan: Memberikan respons yang jelas jika tidak ada kategori sama sekali.
    if (!categories || categories.length === 0) {
      return NextResponse.json({ success: true, data: [], message: "Tidak ada kategori ditemukan." }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: categories }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Membuat kategori baru.
 * Hanya admin yang dapat melakukan aksi ini.
 * @param {Request} request - Objek request masuk yang berisi body JSON dengan data kategori.
 * @returns {Promise<NextResponse>} - Respons JSON berisi data kategori yang baru dibuat atau pesan error.
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

    // Validasi sederhana untuk memastikan nama diisi
    if (!data.name || data.name.trim() === '') {
        return NextResponse.json({ success: false, message: "Nama kategori tidak boleh kosong." }, { status: 400 });
    }

    await connectToDatabase();

    // Buat dokumen baru di database
    const newCategory = await Category.create(data);

    // Tambahan: Memastikan operasi create benar-benar berhasil sebelum mengirim respons.
    if (!newCategory) {
      return NextResponse.json({ success: false, message: "Gagal membuat kategori di database." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });

  } catch (error) {
    // Error code 11000 di MongoDB berarti ada duplikasi data unik (unique index violation)
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat kategori. Nama kategori sudah ada.',
      }, { status: 409 }); // 409 Conflict
    }
    console.error("Error in POST /api/categories:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
