"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Komponen
import FormComponent from '@/components/common/FormComponent';
import PageLayout from '@/components/layouts/PageLayout';
import { Box, CircularProgress, Alert } from '@mui/material';

// Asumsi ada service untuk mengambil dan memperbarui data
import { getBrandById, updateBrand } from '@/lib/services/brandServices'; 
import { useSnackbar } from '@/components/providers/SnackbarProvider';

/**
 * Halaman untuk mengedit data merk yang sudah ada.
 */
export default function EditBrandPage() {
    const {showSnackbar} = useSnackbar();
    const router = useRouter();
    const params = useParams();
    const brandId = params.id; // Mengambil ID dari URL
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // --- PENGAMBILAN DATA AWAL ---
    useEffect(() => {
        if (!brandId) return;

        const fetchBrandData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getBrandById(brandId);
                // Mengisi form dengan data yang ada dari server
                setFormData({
                    name: response.data.name || '',
                    description: response.data.description || '',
                });
            } catch (err) {
                console.error("Gagal memuat data merk:", err);
                setError("Gagal memuat data merk yang akan diedit. Mungkin data tidak ditemukan.");
            } finally {
                setLoading(false);
            }
        };

        fetchBrandData();
    }, [brandId]);

    // --- KONFIGURASI FORM ---
    const formConfig = [
        { name: 'name', label: 'Nama Merk', type: 'text', required: true },
        { name: 'description', label: 'Deskripsi (Opsional)', type: 'textarea', rows: 4 },
    ];

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    // --- HANDLER UNTUK SUBMIT FORM ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});

        try {
            await updateBrand(brandId, formData);
            showSnackbar('Merk berhasil diperbarui!',"success");
            router.push('/inventaris-tetap/merk'); // Kembali ke halaman daftar merk

        } catch (err) {
            showSnackbar(err || "Gagal memperbarui data:", "error");
            const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
            setSubmitError(errorMessage);
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
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    return (
        <PageLayout title={`Edit Merk: ${formData.name}`}>
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
