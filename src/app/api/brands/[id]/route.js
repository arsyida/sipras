/**
 * @file Mendefinisikan endpoint API untuk operasi pada satu brand spesifik (/api/brands/[id]).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

import {
  getBrandById,
  updateBrandById,
  deleteBrandById
} from '@/lib/api/services/brandServices';

/**
 * Menangani GET untuk mengambil detail satu brand berdasarkan ID.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const brand = await getBrandById(id);
    return NextResponse.json({ success: true, data: brand }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error("Error in GET /api/brands/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani PUT untuk memperbarui satu brand berdasarkan ID.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
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
    const updatedBrand = await updateBrandById(id, data);
    return NextResponse.json({ success: true, data: updatedBrand }, { status: 200 });

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
    console.error("Error in PUT /api/brands/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani DELETE untuk menghapus satu brand berdasarkan ID.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const deletedBrandName = await deleteBrandById(id);
    return NextResponse.json({ success: true, message: `Brand "${deletedBrandName}" berhasil dihapus.` }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.isConflict) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    console.error("Error in DELETE /api/brands/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
