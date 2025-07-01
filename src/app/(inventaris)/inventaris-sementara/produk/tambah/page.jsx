"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Komponen & Service
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from '@/components/providers/SnackbarProvider';
import { createConsumableProduct } from '@/lib/services/consumableServices';
import { getAllCategoriesForDropdown } from '@/lib/services/categoryServices';

/**
 * Halaman untuk menambahkan data produk habis pakai baru.
 */
export default function TambahConsumableProductPage() {
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        product_code: '',
        name: '',
        category: '',
        measurement_unit: 'Pcs', // Nilai default
    });
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);

    // --- PENGAMBILAN DATA DROPDOWN ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setLoading(true);
                const categoryRes = await getAllCategoriesForDropdown();
                setCategoryOptions(categoryRes.data.map(c => ({ value: c._id, label: c.name })));
            } catch (err) {
                showSnackbar("Gagal memuat data kategori untuk form.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchDropdownData();
    }, [showSnackbar]);

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
            await createConsumableProduct(formData);
            showSnackbar('Produk habis pakai baru berhasil ditambahkan!', 'success');
            router.push('/inventaris-tidak-tetap/produk');

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
            <PageLayout title="Tambah Produk Habis Pakai">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            </PageLayout>
        );
    }
    
    return (
        <PageLayout title="Tambah Produk Habis Pakai Baru">
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
                submitButtonText="Simpan Produk"
            />
        </PageLayout>
    );
}
