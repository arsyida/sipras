"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Alert, Box, CircularProgress } from '@mui/material';
import { getCategoryById, updateCategory } from '@/lib/services/categoryServices'; 
import { useSnackbar } from '@/components/providers/SnackbarProvider';

export default function EditKategoriPage() {
      const { showSnackbar } = useSnackbar;
    const router = useRouter();
    const params = useParams();
    const categoryId = params.id;
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!categoryId) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getCategoryById(categoryId);
                setFormData({
                    name: response.data.name || '',
                    description: response.data.description || '',
                });
            } catch (err) {
                setError("Gagal memuat data kategori.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categoryId]);

    const formConfig = [
        { name: 'name', label: 'Nama Kategori', type: 'text', required: true },
        { name: 'description', label: 'Deskripsi (Opsional)', type: 'textarea', rows: 4 },
    ];

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});
        try {
            await updateCategory(categoryId, formData);
            showSnackbar('Kategori berhasil diperbarui!', "success");
            router.push('/inventaris-tetap/kategori');
        } catch (err) {
            showSnackbar(err.message || 'Terjadi Kesalahan', "error")
            setSubmitError(err.message || "Terjadi kesalahan.");
            if (err.errors) setFieldErrors(err.errors);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    return (
        <PageLayout title={`Edit Kategori: ${formData.name}`}>
            {submitError && !Object.keys(fieldErrors).length && (
                <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
            )}
            <FormComponent
                formConfig={formConfig}
                formData={formData}
                errors={fieldErrors}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
            />
        </PageLayout>
    );
}
