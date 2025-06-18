// Lokasi file: /src/app/api/locations/{id}/route.js

import { NextResponse } from 'next/server'; // Impor NextResponse
import connectToDatabase from '@/lib/db';   // Pastikan path sudah benar
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Pastikan path sudah benar
import { validateAdmin } from '@/lib/api'; // Pastikan path sudah benar

// --- HANDLER UNTUK PUT REQUEST ---
export async function PUT(request) { // Perubahan 1: Hanya menerima 'request'
    try {
        const session = await getServerSession(authOptions);

        const validationResponse = await validateAdmin(session);
        if (!validationResponse.success) {
            return NextResponse.json(validationResponse);
        }

        await connectToDatabase();

    } catch (error) {
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

    } catch (error) {
    }
}
