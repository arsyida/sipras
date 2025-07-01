"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Komponen
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

// Service & Hooks
import { recordUsage, getConsumableStockById } from '@/lib/services/consumableServices';
import { useSnackbar } from '@/components/providers/SnackbarProvider';

/**
 * Halaman untuk mencatat pengambilan/pemakaian stok barang habis pakai.
 */
export default function UsagePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showSnackbar } = useSnackbar();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        stockItemId: '',
        quantityTaken: 1,
        person_name: '',
        person_role: '',
        notes: '',
    });
    
    // State untuk menampilkan info stok yang sedang diakses
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    
    // Ambil stockId dari URL
    const stockId = searchParams.get('stockId');

    // --- PENGAMBILAN DATA AWAL ---
    useEffect(() => {
        if (!stockId) {
            showSnackbar("ID Stok tidak valid atau tidak ditemukan di URL.", "error");
            setLoading(false);
            return;
        }

        const fetchStockData = async () => {
            try {
                setLoading(true);
                const response = await getConsumableStockById(stockId);
                const stockData = response.data;

                if (!stockData) {
                    throw new Error("Data stok tidak ditemukan.");
                }

                setStockInfo({
                    name: `${stockData.product?.name || 'N/A'}`,
                    currentQty: stockData.quantity,
                    unit: stockData.unit
                });
                
                setFormData(prev => ({ ...prev, stockItemId: stockId }));

            } catch (err) {
                showSnackbar(err.message || "Gagal memuat detail stok.", "error");
                router.back(); // Kembali ke halaman sebelumnya jika gagal memuat
            } finally {
                setLoading(false);
            }
        };
        fetchStockData();
    }, [stockId, showSnackbar, router]);

    // --- KONFIGURASI FORM ---
    const formConfig = [
        { 
            name: 'quantityTaken', 
            label: `Jumlah Diambil (${stockInfo?.unit || ''})`, 
            type: 'number', 
            required: true, 
            halfWidth: true,
        },
        { 
            name: 'person_name', 
            label: 'Nama Pengambil', 
            type: 'text', 
            required: true, 
            halfWidth: true,
        },
        { name: 'person_role', label: 'Jabatan (Opsional)', type: 'text' },
        { name: 'notes', label: 'Keperluan/Catatan (Opsional)', type: 'textarea', rows: 4 },
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
        setFieldErrors({});

        try {
            const payload = {
                ...formData,
                quantityTaken: parseInt(formData.quantityTaken, 10),
            };

            // Validasi sisi klien sebelum mengirim ke API
            if (payload.quantityTaken > stockInfo.currentQty) {
                throw { message: `Stok tidak mencukupi. Stok tersedia: ${stockInfo.currentQty} ${stockInfo.unit}.` };
            }

            await recordUsage(payload);
            
            showSnackbar('Pengambilan stok berhasil dicatat!', 'success');
            router.push('/inventaris-sementara/'); 

        } catch (err) {
            showSnackbar(err.message || "Terjadi kesalahan saat menyimpan.", 'error');
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageLayout title="Memuat Data Stok...">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Ambil/Gunakan Stok Barang">
            {stockInfo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                        Anda akan mengambil: <strong>{stockInfo.name}</strong>
                    </Typography>
                    <Typography variant="body2">
                        Stok saat ini: <strong>{stockInfo.currentQty} {stockInfo.unit}</strong>
                    </Typography>
                </Alert>
            )}
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
                submitButtonText="Simpan Pengambilan"
            />
        </PageLayout>
    );
}
