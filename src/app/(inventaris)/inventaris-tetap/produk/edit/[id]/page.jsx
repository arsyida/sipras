"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Komponen
import FormComponent from '@/components/common/FormComponent';
import PageLayout from '@/components/layouts/PageLayout';
import { Box, CircularProgress, Alert } from '@mui/material';

// Service untuk mengambil dan memperbarui data
import { getProductById, updateProduct } from '@/lib/services/productServices'; 
import { getAllBrandsForDropdown } from '@/lib/services/brandServices';
import { getAllCategoriesForDropdown } from '@/lib/services/categoryServices';

/**
 * Halaman untuk mengedit data produk yang sudah ada.
 */
export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        product_code: '',
        name: '',
        brand: '',
        category: '',
        measurement_unit: '',
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formOptions, setFormOptions] = useState({
        brand: [],
        category: [],
    });

    // --- PENGAMBILAN DATA AWAL ---
    useEffect(() => {
        if (!productId) return;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Ambil data produk dan data untuk dropdown secara bersamaan
                const [productRes, brandRes, categoryRes] = await Promise.all([
                    getProductById(productId),
                    getAllBrandsForDropdown(),
                    getAllCategoriesForDropdown(),
                ]);

                // Mengisi form dengan data yang ada dari server
                const productData = productRes.data;
                setFormData({
                    product_code: productData.product_code || '',
                    name: productData.name || '',
                    brand: productData.brand?._id || '', // Pastikan mengambil _id
                    category: productData.category?._id || '', // Pastikan mengambil _id
                    measurement_unit: productData.measurement_unit || '',
                });

                // Mengisi opsi untuk dropdown
                setFormOptions({
                    brand: brandRes.data.map((b) => ({ value: b._id, label: b.name })),
                    category: categoryRes.data.map((c) => ({ value: c._id, label: c.name })),
                });

            } catch (err) {
                console.error("Gagal memuat data:", err);
                setError("Gagal memuat data produk yang akan diedit. Mungkin data tidak ditemukan.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [productId]);

    // --- KONFIGURASI FORM ---
    const formConfig = useMemo(() => [
        { name: 'product_code', label: 'Kode Produk', type: 'text', required: true },
        { name: 'name', label: 'Nama Produk', type: 'text', required: true },
        { 
            name: 'brand', 
            label: 'Merk', 
            type: 'select', 
            options: formOptions.brand,
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
            await updateProduct(productId, formData);
            alert('Produk berhasil diperbarui!');
            router.push('/inventaris/produk'); // Kembali ke halaman daftar produk

        } catch (err) {
            console.error("Gagal memperbarui data:", err);
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
    
    if (loading) {
        return (
            <PageLayout title="Edit Produk">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout title="Error">
                <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
            </PageLayout>
        );
    }
    
    return (
        <PageLayout title={`Edit Produk: ${formData.name}`}>
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
                submitButtonText="Perbarui"
            />
        </PageLayout>
    );
}
