/**
 * @file Mendefinisikan endpoint API untuk operasi pada satu aset spesifik (/api/assets/[id]).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

import {
  getAssetById,
  updateAssetById,
  deleteAssetById
} from '@/lib/api/services/assetServices';

/**
 * Menangani GET untuk mengambil detail satu aset berdasarkan ID.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const asset = await getAssetById(params.id);
    return NextResponse.json({ success: true, data: asset }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error("Error in GET /api/assets/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani PUT untuk memperbarui data satu aset (misal: pindah lokasi, ubah kondisi).
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function PUT(request, { params }) {
  try {
    // Aksi ini bisa dilakukan oleh staf biasa, jadi hanya perlu validasi sesi login.
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const updatedAsset = await updateAssetById(params.id, data);
    return NextResponse.json({ success: true, data: updatedAsset }, { status: 200 });

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
    console.error("Error in PUT /api/assets/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani DELETE untuk menghapus satu aset secara permanen.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(request, { params }) {
  try {
    // Menghapus aset adalah aksi krusial, memerlukan hak akses admin.
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    await deleteAssetById(params.id);
    return NextResponse.json({ success: true, message: 'Aset berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error("Error in DELETE /api/assets/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
