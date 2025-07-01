"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Komponen & Service
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Box, CircularProgress, Alert, Typography, Grid, TextField, IconButton, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { getAllProductsForDropdown } from '@/lib/services/productServices';
import { getAllLocationsForDropdown } from '@/lib/services/locationServices';
import { createBulkAssetsByRoom } from '@/lib/services/assetServices';
import { useSnackbar } from '@/components/providers/SnackbarProvider';
import { useConfirmation } from '@/components/providers/ConfirmationDialogProvider';

/**
 * Halaman untuk menambahkan data inventaris tetap baru dengan form dinamis.
 */
export default function TambahAsetPage() {
    const {showSnackbar} = useSnackbar();
    const {showConfirmation} = useConfirmation();
    const router = useRouter();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        product: '',
        location: '',
        purchase_date: '',
        estimated_price: 0,
        condition: 'baik',
    });
    
    const [attributes, setAttributes] = useState([{ key: '', value: '' }]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [options, setOptions] = useState({ products: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // --- PENGAMBILAN DATA DROPDOWN ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setLoading(true);
                const [productsRes, locationsRes] = await Promise.all([
                    getAllProductsForDropdown(),
                    getAllLocationsForDropdown(),
                ]);
                
                setOptions({
                    products: productsRes.data || [],
                    locations: locationsRes.data.map(l => ({ value: l._id, label: `Gd. ${l.building} - Lt. ${l.floor} - R. ${l.name}` })),
                });
            } catch (err) {
                setSubmitError("Gagal memuat data pilihan. Silakan coba lagi.");
            } finally {
                setLoading(false);
            }
        };
        fetchDropdownData();
    }, []);

    // --- LOGIKA DINAMIS ---
    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }

        if (name === 'product') {
            const productData = options.products.find(p => p._id === value);
            setSelectedProduct(productData || null);
            setAttributes([{ key: '', value: '' }]);
        }
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = value;
        setAttributes(newAttributes);
    };

    const addAttributeRow = () => setAttributes([...attributes, { key: '', value: '' }]);
    const removeAttributeRow = (index) => {
        if (attributes.length > 1) {
            setAttributes(attributes.filter((_, i) => i !== index));
        }
    };
    
    // --- KONFIGURASI FORM UTAMA ---
    const formConfig = useMemo(() => [
        { 
            name: 'product', 
            label: 'Produk', 
            type: 'select', 
            options: options.products.map(p => ({ value: p._id, label: `${p.name} - ${p.brand?.name || ''}` })), 
            required: true 
        },
        { name: 'location', label: 'Lokasi', type: 'select', options: options.locations, required: true },
        { 
            name: 'quantity', 
            label: 'Jumlah', 
            type: 'number', 
            required: true, 
            halfWidth: true, 
            min: 1, 
            defaultValue: 1,
            errorMessage: 'Jumlah harus minimal 1.'
        },
        { name: 'purchase_date', label: 'Tahun Perolehan', type: 'text', halfWidth: true },
        { 
            name: 'condition', 
            label: 'Kondisi', 
            type: 'select', 
            required: true,
            halfWidth: true,
            options: [
                { value: 'Baik', label: 'Baik' },
                { value: 'Kurang Baik', label: 'Kurang Baik' },
                { value: 'Rusak', label: 'Rusak' },
            ]
        },
        { name: 'estimated_price', label: 'Estimasi Harga (Rp)', type: 'number' },
        // PERBAIKAN: Hapus 'attributes' dari sini.
    ], [options]);

    // --- HANDLER SUBMIT ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});

        const attributesObject = attributes.reduce((acc, attr) => {
            if (attr.key.trim()) {
                const numericValue = parseFloat(attr.value);
                acc[attr.key.trim()] = isNaN(numericValue) ? attr.value : numericValue;
            }
            return acc;
        }, {});

        const payload = {
            ...formData,
            quantity: parseInt(formData.quantity, 10) || 1,
            estimated_price: parseFloat(formData.estimated_price) || 0,
            ...(Object.keys(attributesObject).length > 0 && { attributes: attributesObject }),
        };
        console.log("Payload yang akan dikirim:", payload);

        try {
            await createBulkAssetsByRoom(payload);
            showSnackbar('Aset baru berhasil ditambahkan!',"success");
            router.push('/inventaris-tetap/tambah'); 
        } catch (err) {
            const errorMessage = err.message || "Terjadi kesalahan.";
            setSubmitError(errorMessage);
            if (err.errors) setFieldErrors(err.errors);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) return (
        <PageLayout title="Tambah Aset Baru">
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        </PageLayout>
    );

    return (
        <PageLayout title="Tambah Aset Baru">
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
            >
                {/* PERBAIKAN: Bagian dinamis sekarang menjadi 'children' dari FormComponent */}
                {selectedProduct?.measurement_unit === 'Meter' && (
                    <Box mt={3} p={2} border={1} borderColor="grey.300" borderRadius={1}>
                        <Typography variant="h6" gutterBottom>Atribut Tambahan</Typography>
                        {attributes.map((attr, index) => (
                            <Box display="flex" gap={2} key={index} mb={2}>
                                <Box flexGrow={1}>
                                    <TextField 
                                        label="Nama Atribut (cth: panjang)"
                                        value={attr.key}
                                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <Box flex={1}>
                                    <TextField 
                                        label="Nilai Atribut (cth: 5.5)"
                                        value={attr.value}
                                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <IconButton onClick={() => removeAttributeRow(index)} disabled={attributes.length <= 1}>
                                        <RemoveCircleOutlineIcon color='error' />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                        <Button startIcon={<AddCircleOutlineIcon />} onClick={addAttributeRow}>
                            Tambah Atribut
                        </Button>
                    </Box>
                )}
            </FormComponent>
        </PageLayout>
    );
}
