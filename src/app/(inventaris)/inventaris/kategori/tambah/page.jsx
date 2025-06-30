"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/layouts/PageLayout';
import FormComponent from '@/components/common/FormComponent';
import { Alert, Box } from '@mui/material';
import { createCategory } from '@/lib/services/categoryServices';

export default function TambahKategoriPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const formConfig = [
        { name: 'name', label: 'Nama Kategori', type: 'text', required: true },
        { name: 'description', label: 'Deskripsi (Opsional)', type: 'textarea', rows: 4 },
    ];

    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({...prev, [name]: undefined}));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});
        try {
            await createCategory(formData);
            alert('Kategori baru berhasil ditambahkan!');
            router.push('/inventaris/kategori');
        } catch (err) {
            setSubmitError(err.message || "Terjadi kesalahan.");
            if (err.errors) setFieldErrors(err.errors);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageLayout title="Tambah Kategori Baru">
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
