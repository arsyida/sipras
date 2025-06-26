"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Komponen
import FormComponent from '@/components/common/FormComponent'; // Pastikan path ini benar
import InventoryPageLayout from '@/components/common/InventoryPageLayout';
import { Box, CircularProgress, Alert } from '@mui/material';

// Service untuk mengambil data
import { getLocationById } from '@/lib/services/locationServices';
import { createAsset } from '@/lib/services/assetServices'; 

/**
 * Halaman untuk menambahkan data inventaris tetap baru dengan error handling yang baik.
 */
export default function EditLocationPage() {
    const locationId = useParams().id;
    const router = useRouter();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: '',
        building: '',
        floor: '',
        description: '',
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Error untuk data loading awal
    
    // State baru untuk proses submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null); // Error spesifik dari API submit
    const [fieldErrors, setFieldErrors] = useState({}); // Error per field dari Zod

    // --- PENGAMBILAN DATA DROPDOWN ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setLoading(true);
                const locationsRes = await getLocationById(locationId);
                setFormData({
                    name: locationsRes.name || '',
                    building: locationsRes.building || '',
                    floor: locationsRes.floor || '',
                    description: locationsRes.description || '',
                });
            } catch (err) {
                console.error("Gagal memuat data untuk form:", err);
                setError("Gagal memuat data pilihan. Silakan coba lagi.");
            } finally {
                setLoading(false);
            }
        };
        fetchDropdownData();
    }, []);

    // --- KONFIGURASI FORM ---
    const formConfig = [
        { name: 'name', label: 'Ruangan', type: 'text', required: true },
        { name: 'building', label: 'Gedung', type: 'text', required: true, halfWidth: true },
        { name: 'floor', label: 'Lantai', type: 'text', required: true, halfWidth: true },
        { name: 'description', label: 'Deskripsi', type: 'textarea', required: false, halfWidth: true },
    ];

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Hapus error untuk field yang sedang diubah
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
            // Konversi tipe data sebelum mengirim
            const payload = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                estimated_price: parseFloat(formData.estimated_price),
            };

            await createAsset(payload);
            
            alert('Aset berhasil ditambahkan!');
            router.push('/inventaris-tetap/tambah'); // Ganti dengan path yang sesuai

        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
            setSubmitError(errorMessage);
            // Jika ada error validasi dari Zod (backend), tampilkan di field yang relevan
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
        <InventoryPageLayout title="Tambah Inventaris Tetap Baru">
            {submitError && !Object.keys(fieldErrors).length && (
                <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
            )}

            <FormComponent
                title="Form Tambah Inventaris Tetap"
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors} // Kirim fieldErrors ke form
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting} // Kirim status submitting ke form
            />
        </InventoryPageLayout>
    );
}
