
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api/validate-admin';
import { registerBulkAssets } from '@/lib/api/services/assetServices'; // Import service baru

/**
 * Menangani POST untuk mendaftarkan beberapa aset baru (bulk create).
 */
export async function POST(request) {
  try {
    // Validasi sesi dan hak akses admin
    const session = await getServerSession(authOptions);
    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json({ message: validationResponse.message }, { status: validationResponse.status });
    }

    const data = await request.json();
    
    // Panggil service untuk bulk create
    const newAssets = await registerBulkAssets(data);

    return NextResponse.json({ success: true, data: newAssets, message: `${newAssets.length} aset berhasil dibuat.` }, { status: 201 });

  } catch (error) {
    // Tangani error validasi dari Zod
    if (error.isValidationError) {
      return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
    }
    // Tangani error duplikasi dari database
    if (error.isDuplicate) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    
    console.error("Error in POST /api/assets:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}