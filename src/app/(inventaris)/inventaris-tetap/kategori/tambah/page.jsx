"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Komponen
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Alert, Box } from '@mui/material';

// Service & Hook
import { createCategory } from '@/lib/services/categoryServices';
import { useSnackbar } from '@/components/providers/SnackbarProvider';

/**
 * Halaman untuk menambahkan data kategori baru.
 * Menggunakan sistem notifikasi Snackbar untuk feedback.
 */
export default function TambahKategoriPage() {
    const router = useRouter();
    const { showSnackbar } = useSnackbar(); // Gunakan hook untuk menampilkan notifikasi
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State error spesifik untuk validasi Zod di backend
    const [fieldErrors, setFieldErrors] = useState({});

    // --- KONFIGURASI FORM ---
    const formConfig = [
        { name: 'name', label: 'Nama Kategori', type: 'text', required: true },
        { name: 'description', label: 'Deskripsi (Opsional)', type: 'textarea', rows: 4 },
    ];

    // --- EVENT HANDLERS ---
    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Hapus error untuk field yang sedang diubah agar UI bersih
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setFieldErrors({}); // Reset error setiap kali submit
        
        try {
            await createCategory(formData);
            
            // Tampilkan notifikasi sukses
            showSnackbar('Kategori baru berhasil ditambahkan!', 'success');
            
            // Arahkan kembali ke halaman daftar kategori
            router.push('/inventaris/kategori');

        } catch (err) {
            // Tampilkan notifikasi error umum
            showSnackbar(err.message || "Terjadi kesalahan yang tidak diketahui.", 'error');
            
            // Jika ada detail error per field dari Zod, tampilkan di form
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageLayout title="Tambah Kategori Baru">
            {/* Komponen Alert untuk error umum tidak lagi diperlukan di sini,
              karena semua feedback (sukses dan gagal) sudah ditangani oleh Snackbar.
              Ini membuat UI lebih bersih.
            */}
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
            />
        </PageLayout>
    );
}
