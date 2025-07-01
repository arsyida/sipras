"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Komponen
import FormComponent from '@/components/common/FormComponent';
import PageLayout from '@/components/layouts/PageLayout';
import { Alert, CircularProgress, Box } from '@mui/material';

// Service untuk membuat produk dan mengambil data dropdown
import { createProduct } from '@/lib/services/productServices'; 
import { getAllBrandsForDropdown } from '@/lib/services/brandServices';
import { getAllCategoriesForDropdown } from '@/lib/services/categoryServices';

/**
 * Halaman untuk menambahkan data produk baru.
 */
export default function TambahProdukPage() {
    const router = useRouter();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        product_code: '',
        name: '',
        brand: '',
        category: '',
        measurement_unit: '',
    });
    
    // State untuk proses submit dan data dropdown
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formOptions, setFormOptions] = useState({
        brand: [],
        category: [],
    });

    // --- PENGAMBILAN DATA UNTUK DROPDOWN ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [brandRes, categoryRes] = await Promise.all([
                    getAllBrandsForDropdown(),
                    getAllCategoriesForDropdown(),
                ]);
                setFormOptions({
                    brand: brandRes.data.map((b) => ({ value: b._id, label: b.name })),
                    category: categoryRes.data.map((c) => ({ value: c._id, label: c.name })),
                });
            } catch (err) {
                setSubmitError("Gagal memuat data untuk form. Silakan refresh halaman.");
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchDropdownData();
    }, []);

    // --- KONFIGURASI FORM ---
    const formConfig = useMemo(() => [
        { name: 'product_code', label: 'Kode Produk', type: 'text', required: true },
        { name: 'name', label: 'Nama Produk', type: 'text', required: true },
        { 
            name: 'brand', 
            label: 'Merk', 
            type: 'select', 
            options: formOptions.brand,
            // Opsi untuk brand "Tanpa Merek" bisa ditambahkan di sini jika perlu
        },
        { 
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: formOptions.category, 
            required: true 
        },
        { 
            name: 'measurement_unit', 
            label: 'Satuan Pengukuran', 
            type: 'select', 
            options: [
                { value: 'Pcs', label: 'Pcs' },
                { value: 'Meter', label: 'Meter' },
                { value: 'Susun', label: 'Susun' },
                { value: 'Set', label: 'Set' },
            ],
            required: true 
        },
    ], [formOptions]);

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
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
            await createProduct(formData);
            alert('Produk baru berhasil ditambahkan!');
            router.push('/inventaris/produk'); // Kembali ke halaman daftar produk

        } catch (err) {
            console.error("Gagal menyimpan data produk:", err);
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
    
    if (loadingOptions) {
        return (
            <PageLayout title="Tambah Produk Baru">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Tambah Produk Baru">
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
