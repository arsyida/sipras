"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Komponen
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert } from '@mui/material';

// Service untuk mengambil dan memperbarui data
import { getLocationById, updateLocation } from '@/lib/services/locationServices'; 
import PageLayout from '@/components/layouts/PageLayout';

/**
 * Halaman untuk mengedit data lokasi yang sudah ada.
 */
export default function EditLocationPage() {
    const router = useRouter();
    const params = useParams();
    const locationId = params.id; // Mengambil ID dari URL
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: '',
        building: '',
        floor: '',
        description: '',
    });
    
    const [loading, setLoading] = useState(true); // Loading untuk data awal
    const [error, setError] = useState(null); // Error untuk data loading awal
    
    // State untuk proses submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // --- PENGAMBILAN DATA AWAL ---
    useEffect(() => {
        if (!locationId) return; // Jangan lakukan apa-apa jika ID belum tersedia

        const fetchLocationData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getLocationById(locationId);
                // Mengisi form dengan data yang ada dari server
                setFormData({
                    name: response.data.name || '',
                    building: response.data.building || '',
                    floor: response.data.floor || '',
                    description: response.data.description || '',
                });
            } catch (err) {
                console.error("Gagal memuat data lokasi:", err);
                setError("Gagal memuat data lokasi yang akan diedit. Mungkin data tidak ditemukan.");
            } finally {
                setLoading(false);
            }
        };

        fetchLocationData();
    }, [locationId]); // Jalankan efek ini jika locationId berubah

    // --- KONFIGURASI FORM ---
    const formConfig = [
        { name: 'name', label: 'Nama Ruang', type: 'text', required: true },
        { name: 'building', label: 'Gedung', type: 'text', required: true, halfWidth: true },
        { name: 'floor', label: 'Lantai', type: 'text', required: true, halfWidth: true },
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
            // Memanggil service updateLocation dengan ID dan data form
            await updateLocation(locationId, formData);
            
            alert('Lokasi berhasil diperbarui!');
            router.push('/inventaris/lokasi'); // Kembali ke halaman daftar lokasi

        } catch (err) {
            console.error("Gagal memperbarui data:", err);
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
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    return (
        <PageLayout title={`Edit Lokasi: ${formData.name}`}>
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
