"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Komponen
import FormComponent from '@/components/common/FormComponent';
import PageLayout from '@/components/layouts/PageLayout';
import { Box, Alert } from '@mui/material';

// Asumsi ada service untuk membuat data merk baru
import { createBrand } from '@/lib/services/brandServices'; 

/**
 * Halaman untuk menambahkan data merk baru.
 */
export default function TambahMerkPage() {
    const router = useRouter();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    
    // State untuk proses submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // --- KONFIGURASI FORM ---
    const formConfig = [
        { name: 'name', label: 'Nama Merk', type: 'text', required: true },
        { name: 'description', label: 'Deskripsi (Opsional)', type: 'textarea', rows: 4 },
    ];

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Hapus error untuk field yang sedang diubah
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // --- HANDLER UNTUK SUBMIT FORM ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});

        try {
            // Memanggil service createBrand dengan data dari form
            await createBrand(formData);
            
            alert('Merk baru berhasil ditambahkan!');
            router.push('/inventaris/merk'); // Kembali ke halaman daftar merk

        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
            setSubmitError(errorMessage);
            // Jika ada error validasi dari Zod, tampilkan di field yang relevan
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };
    
    return (
        <PageLayout title="Tambah Merk Baru">
            {/* Tampilkan error umum dari API jika ada */}
            {submitError && !Object.keys(fieldErrors).length && (
                <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
            )}

            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
            />
        </PageLayout>
    );
}
