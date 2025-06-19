// Lokasi: /src/app/api/categories/[id]/route.js

import { NextResponse } from 'next/server'; 
import connectToDatabase from '@/lib/db';  
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateAdmin } from '@/lib/api';
import Category from '@/models/Category';

export async function GET(req,{ params }) {
  const { id: _id} = await params;
  try {
    const session = await getServerSession(authOptions);

    const validationResponse = validateAdmin(session);
    if (!validationResponse.success) {
      return NextResponse.json(validationResponse, { status: 403 });
    }
    await connectToDatabase();
    const categories = await Category.find({_id});
    if (!categories || categories.length === 0) {
      return NextResponse.json({ success: false, status: 404, message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, status: 200, data: categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, status: 500, message: error.message }, { status: 500 });
  }
}


// --- HANDLER UNTUK PUT REQUEST ---
export async function PUT(request, { params }) { 
    const { id: _id } = await params;
    const data = await request.json();
    try {
        const session = await getServerSession(authOptions);

        const validationResponse = validateAdmin(session);
        if (!validationResponse.success) {
            return NextResponse.json(validationResponse);
        }
        await connectToDatabase();
        const category = await Category.findByIdAndUpdate(_id, data, { new: true });
        if (!category) {
            return NextResponse.json({ success: false, status: 404, message: 'Kategori tidak ditemukan.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, status: 200, data: category }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, status: 500, message: error.message }, { status: 500 });
    }
}

// --- HANDLER UNTUK DELETE REQUEST ---
export async function DELETE(request,{ params }) {
    const { id: _id } = await params;
    try {
        const session = await getServerSession(authOptions);

        const validationResponse = validateAdmin(session);
        if (!validationResponse.success) {
            return NextResponse.json(validationResponse);
        }
        await connectToDatabase();
        const category = await Category.findByIdAndDelete(_id);
        if (!category) {
            return NextResponse.json({ success: false, status: 404, message: 'Kategori tidak ditemukan.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, status: 200, message: 'Kategori berhasil dihapus.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, status: 500, message: error.message }, { status: 500 });
    }
}
