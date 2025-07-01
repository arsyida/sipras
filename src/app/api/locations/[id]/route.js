/**
 * @file Mendefinisikan endpoint API untuk operasi pada satu lokasi spesifik (/api/locations/[id]).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

// Impor fungsi-fungsi service yang relevan
import {
  getLocationById,
  updateLocationById,
  deleteLocationById
} from '@/lib/api/services/locationServices';

/**
 * Menangani GET untuk mengambil detail satu lokasi berdasarkan ID.
 * @param {Request} request - Objek request masuk.
 * @param {{ params: { id: string } }} context - Konteks berisi ID dari URL.
 * @returns {Promise<NextResponse>} Respons JSON dengan data lokasi.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const location = await getLocationById(id);
    return NextResponse.json({ success: true, data: location }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error("Error in GET /api/locations/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani PUT untuk memperbarui satu lokasi berdasarkan ID.
 * @param {Request} request - Objek request dengan body JSON.
 * @param {{ params: { id: string } }} context - Konteks berisi ID dari URL.
 * @returns {Promise<NextResponse>} Respons JSON dengan data yang sudah diperbarui.
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
    const updatedLocation = await updateLocationById(id, data);
    return NextResponse.json({ success: true, data: updatedLocation }, { status: 200 });

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
    console.error("Error in PUT /api/locations/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani DELETE untuk menghapus satu lokasi berdasarkan ID.
 * @param {Request} request - Objek request masuk.
 * @param {{ params: { id: string } }} context - Konteks berisi ID dari URL.
 * @returns {Promise<NextResponse>} Respons JSON dengan pesan sukses.
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    await deleteLocationById(id);
    return NextResponse.json({ success: true, message: 'Lokasi berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.isConflict) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    console.error("Error in DELETE /api/locations/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
