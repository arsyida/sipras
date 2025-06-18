// Lokasi file: /src/app/api/categories/route.js

import { NextResponse } from 'next/server'; // Impor NextResponse
import connectToDatabase from '@/lib/db';   // Pastikan path sudah benar
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Pastikan path sudah benar
import { validateAdmin } from '@/lib/api'; // Pastikan path sudah benar

// --- HANDLER UNTUK GET REQUEST ---
export async function GET(request) { // Perubahan 1: Hanya menerima 'request'
  try {
    const session = await getServerSession(authOptions);

    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json(validationResponse);
    }

    await connectToDatabase();

    const products = await Product.find({}).sort({ name: 1 });
    // Perubahan 3: Gunakan NextResponse untuk mengirim response
    return NextResponse.json({ success: true, status: 200, data: products }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, status: 500, message: error.message }, { status: 500 });
  }
}

// --- HANDLER UNTUK POST REQUEST ---
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json(validationResponse);
    }
    
    // Perubahan 4: Ambil body dari request
    const body = await request.json();

    await connectToDatabase();

    const products = await Product.create(body);
    return NextResponse.json({ success: true, status: 201, data: products }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, status: 400, message: error.message }, { status: 400 });
  }
}
