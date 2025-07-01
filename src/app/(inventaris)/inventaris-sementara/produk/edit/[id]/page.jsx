"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Komponen & Service
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from '@/components/providers/SnackbarProvider';
import { getConsumableProductById, updateConsumableProduct } from '@/lib/services/consumableServices';
import { getAllCategoriesForDropdown } from '@/lib/services/categoryServices';

/**
 * Halaman untuk mengedit data produk habis pakai yang sudah ada.
 */
export default function EditConsumableProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;
    const { showSnackbar } = useSnackbar();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        product_code: '',
        name: '',
        category: '',
        measurement_unit: 'Pcs',
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);

    // --- PENGAMBILAN DATA AWAL ---
    useEffect(() => {
        if (!productId) return;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [productRes, categoryRes] = await Promise.all([
                    getConsumableProductById(productId),
                    getAllCategoriesForDropdown(),
                ]);

                const productData = productRes.data;
                setFormData({
                    product_code: productData.product_code || '',
                    name: productData.name || '',
                    category: productData.category?._id || '',
                    measurement_unit: productData.measurement_unit || 'Pcs',
                });

                setCategoryOptions(categoryRes.data.map(c => ({ value: c._id, label: c.name })));

            } catch (err) {
                console.error("Gagal memuat data:", err);
                setError("Gagal memuat data produk yang akan diedit.");
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
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: categoryOptions, 
            required: true 
        },
        { 
            name: 'measurement_unit', 
            label: 'Satuan Pengukuran', 
            type: 'select', 
            options: [
                { value: 'Pcs', label: 'Pcs' },
                { value: 'Kotak', label: 'Kotak' },
                { value: 'Lusin', label: 'Lusin' },
                { value: 'Rim', label: 'Rim' },
                { value: 'Roll', label: 'Roll' },
                { value: 'Pack', label: 'Pack' },
            ],
            required: true 
        },
    ], [categoryOptions]);

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // --- HANDLER UNTUK SUBMIT FORM ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setFieldErrors({});

        try {
            await updateConsumableProduct(productId, formData);
            showSnackbar('Produk berhasil diperbarui!', 'success');
            router.push('/inventaris-habis-pakai/produk');

        } catch (err) {
            showSnackbar(err.message || "Terjadi kesalahan.", 'error');
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageLayout title="Memuat Data Produk...">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
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
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
                submitButtonText="Perbarui Produk"
            />
        </PageLayout>
    );
}
