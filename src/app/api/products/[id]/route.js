/**
 * @file Mendefinisikan endpoint API untuk operasi pada satu produk spesifik (/api/products/[id]).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';

import {
  getProductById,
  updateProductById,
  deleteProductById
} from '@/lib/api/services/productServices';

/**
 * Menangani GET untuk mengambil detail satu produk berdasarkan ID.
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

    const product = await getProductById(id);
    return NextResponse.json({ success: true, data: product }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    console.error("Error in GET /api/products/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani PUT untuk memperbarui satu produk berdasarkan ID.
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
    const updatedProduct = await updateProductById(id, data);
    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });

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
    console.error("Error in PUT /api/products/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

/**
 * Menangani DELETE untuk menghapus satu produk berdasarkan ID.
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

    await deleteProductById(id);
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus.' }, { status: 200 });

  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.isConflict) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    console.error("Error in DELETE /api/products/[id]:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
