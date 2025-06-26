/**
 * @file Mendefinisikan endpoint API untuk operasi pada satu kategori spesifik (/api/categories/[id]).
 * File ini berfungsi sebagai Controller, bertanggung jawab untuk HTTP handling dan memanggil service layer.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor semua fungsi service terkait kategori dari satu file terpusat
import {
  getCategoryById,
  updateCategoryById,
  deleteCategoryById
} from '@/lib/api/services/categoryServices';

/**
 * Menangani permintaan GET untuk mengambil detail satu kategori berdasarkan ID.
 * Membutuhkan otentikasi (semua peran yang login boleh melihat).
 * @param {Request} request - Objek request masuk (tidak digunakan).
 * @param {{ params: { id: string } }} context - Konteks berisi ID dari URL.
 * @returns {Promise<NextResponse>} Respons JSON dengan data kategori atau pesan error.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const category = await getCategoryById(id);
    return NextResponse.json({ success: true, data: category }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error("Error in GET /api/categories/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani permintaan PUT untuk memperbarui satu kategori berdasarkan ID.
 * Membutuhkan otorisasi sebagai admin.
 * @param {Request} request - Objek request masuk dengan body JSON berisi data update.
 * @param {{ params: { id: string } }} context - Konteks berisi ID dari URL.
 * @returns {Promise<NextResponse>} Respons JSON dengan data yang sudah diperbarui atau pesan error.
 */
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    const updatedCategory = await updateCategoryById(id, data);

    return NextResponse.json({ success: true, data: updatedCategory }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }

    console.error("Error in PUT /api/categories/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani permintaan DELETE untuk menghapus satu kategori berdasarkan ID.
 * Membutuhkan otorisasi sebagai admin.
 * @param {Request} request - Objek request masuk (tidak digunakan).
 * @param {{ params: { id: string } }} context - Konteks berisi ID dari URL.
 * @returns {Promise<NextResponse>} Respons JSON dengan pesan sukses atau error.
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    await deleteCategoryById(id);

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.isConflict) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }

    console.error("Error in DELETE /api/categories/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
