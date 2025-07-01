"use client";

import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';

// Komponen
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

// Service & Hooks
import { recordUsage, getConsumableStockById } from '@/lib/services/consumableServices';
import { useSnackbar } from '@/components/providers/SnackbarProvider';

/**
 * Komponen pembantu untuk menangani logika fetching data dan form
 * Ini dipisahkan agar bisa dibungkus oleh Suspense jika diperlukan di Server Component induk,
 * meskipun di sini UsagePage sudah client component.
 */
function UsageFormContent() {
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
    // Pastikan stockId selalu diambil di dalam komponen client ini
    const stockId = searchParams.get('stockId');

    // --- PENGAMBILAN DATA AWAL ---
    useEffect(() => {
        // Cek jika stockId belum ada, return dan jangan coba fetch
        if (!stockId) {
            // Kita mungkin tidak perlu langsung showSnackbar di sini,
            // karena PageLayout utama bisa menampilkan fallback jika stockId null
            // Atau Anda bisa tetap showSnackbar jika ingin memberitahu user lebih awal
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
                console.error("Failed to load stock detail:", err);
                showSnackbar(err.message || "Gagal memuat detail stok.", "error");
                router.back(); // Kembali ke halaman sebelumnya jika gagal memuat
            } finally {
                setLoading(false);
            }
        };
        fetchStockData();
    }, [stockId, showSnackbar, router]); // Dependency array memastikan ini berjalan saat stockId berubah

    // --- KONFIGURASI FORM ---
    // Pastikan formConfig dibuat setelah stockInfo tersedia
    const formConfig = [
        {
            name: 'quantityTaken',
            label: `Jumlah Diambil (${stockInfo?.unit || ''})`,
            type: 'number',
            required: true,
            halfWidth: true,
            min: 1, // Tambahkan min value untuk quantityTaken
            max: stockInfo?.currentQty || 999999999, // Max value berdasarkan stok tersedia
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
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
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
            if (!stockInfo || payload.quantityTaken > stockInfo.currentQty) {
                // Memastikan stockInfo ada dan kuantitas cukup
                throw { message: `Stok tidak mencukupi. Stok tersedia: ${stockInfo?.currentQty || 0} ${stockInfo?.unit || ''}.` };
            }
            if (payload.quantityTaken <= 0) {
                 throw { message: "Jumlah yang diambil harus lebih dari 0." };
            }
            if (!payload.person_name) {
                throw { message: "Nama Pengambil wajib diisi." };
            }

            await recordUsage(payload);

            showSnackbar('Pengambilan stok berhasil dicatat!', 'success');
            router.push('/inventaris-sementara'); // Kembali ke halaman daftar setelah sukses

        } catch (err) {
            showSnackbar(err.message || "Terjadi kesalahan saat menyimpan.", 'error');
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tampilkan loading spinner saat data sedang dimuat
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Jika stockInfo null setelah loading selesai (misal: ID tidak valid, atau data tidak ditemukan)
    if (!stockInfo && !loading) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                Data stok tidak ditemukan atau ID tidak valid. Silakan kembali.
            </Alert>
        );
    }

    return (
        <>
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
        </>
    );
}

/**
 * Halaman utama untuk mencatat pengambilan/pemakaian stok barang habis pakai.
 * Membungkus UsageFormContent dengan Suspense untuk penanganan initial render.
 */
export default function UsagePage() {
    return (
        <PageLayout title="Ambil/Gunakan Stok Barang">
            {/* Suspense ini akan menangani jika useSearchParams belum siap di render pertama kali */}
            <Suspense fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                    <Typography ml={2}>Memuat informasi stok...</Typography>
                </Box>
            }>
                <UsageFormContent />
            </Suspense>
        </PageLayout>
    );
}