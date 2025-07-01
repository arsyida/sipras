"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Komponen & Service
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from '@/components/providers/SnackbarProvider';
import { recordRestock } from '@/lib/services/consumableServices';
import { getAllConsumableProductsForDropdown } from '@/lib/services/consumableServices';

/**
 * Halaman untuk mencatat penambahan stok barang habis pakai (Restock).
 */
export default function RestockPage() {
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        productId: '',
        quantityAdded: 1,
        unit: '', // Akan diisi otomatis berdasarkan produk yang dipilih
        person_name: '',
        person_role: '',
        notes: '',
    });
    
    const [options, setOptions] = useState({ products: [] });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // --- PENGAMBILAN DATA DROPDOWN ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setLoading(true);
                const productsRes = await getAllConsumableProductsForDropdown();
                // Simpan data produk lengkap untuk mendapatkan satuan (measurement_unit)
                setOptions({ products: productsRes.data || [] });
            } catch (err) {
                showSnackbar("Gagal memuat data produk. Silakan coba lagi.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchDropdownData();
    }, [showSnackbar]);

    // --- EVENT HANDLERS ---
    const handleFormChange = (name, value) => {
        let newFormData = { ...formData, [name]: value };

        // Jika produk berubah, update juga satuannya secara otomatis
        if (name === 'productId') {
            const selectedProd = options.products.find(p => p._id === value);
            newFormData.unit = selectedProd ? selectedProd.measurement_unit : '';
        }

        setFormData(newFormData);
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setFieldErrors({});

        try {
            const payload = {
                ...formData,
                quantityAdded: parseInt(formData.quantityAdded, 10),
            };
            await recordRestock(payload);
            
            showSnackbar('Stok berhasil ditambahkan!', 'success');
            router.push('/inventaris-sementara'); 

        } catch (err) {
            showSnackbar(err.message || "Terjadi kesalahan saat menyimpan.", 'error');
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- KONFIGURASI FORM ---
    const formConfig = useMemo(() => [
        { name: 'person_name', label: 'Nama Penambah Stok', type: 'text', required: true, halfWidth: true },
        { name: 'person_role', label: 'Jabatan (Opsional)', type: 'text', halfWidth: true },
        { 
            name: 'productId', 
            label: 'Produk', 
            type: 'select', 
            options: options.products.map(p => ({ value: p._id, label: `${p.name} (${p.product_code})` })), 
            required: true 
        },
        { 
            name: 'quantityAdded', 
            label: 'Jumlah Masuk', 
            type: 'number', 
            required: true, 
            halfWidth: true,
        },
        { 
            name: 'unit', 
            label: 'Satuan', 
            type: 'text', 
            required: true, 
            halfWidth: true,
            disabled: true, // Satuan tidak bisa diubah, mengikuti produk
        },
        { name: 'notes', label: 'Catatan (Opsional)', type: 'textarea', rows: 4 },
    ], [options.products]);

    if (loading) {
        return (
            <PageLayout title="Tambah Stok Barang">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Tambah Stok Barang (Restock)">
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
                submitButtonText="Simpan Stok Masuk"
            />
        </PageLayout>
    );
}
