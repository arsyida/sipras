"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Komponen
import FormComponent from "@/components/common/FormComponent";
import { Alert } from "@mui/material";

// Service untuk membuat data baru
import { createLocation } from "@/lib/services/locationServices";
import PageLayout from "@/components/common/PageLayout";

/**
 * Halaman untuk menambahkan data lokasi baru.
 */
export default function TambahLokasiPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    name: "",
    building: "",
    floor: "",
    description: "",
  });

  // State untuk proses submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- KONFIGURASI FORM ---
  const formConfig = [
    { name: "name", label: "Nama Ruang", type: "text", required: true },
    {
      name: "building",
      label: "Gedung",
      type: "text",
      required: true,
      halfWidth: true,
    },
    {
      name: "floor",
      label: "Lantai",
      type: "text",
      required: true,
      halfWidth: true,
    },
    {
      name: "description",
      label: "Deskripsi (Opsional)",
      type: "textarea",
      rows: 4,
    },
  ];

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus error untuk field yang sedang diubah
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // --- HANDLER UNTUK SUBMIT FORM ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      // Memanggil service createLocation dengan data dari form
      await createLocation(formData);

      alert("Lokasi baru berhasil ditambahkan!");
      router.push("/inventaris/lokasi"); // Kembali ke halaman daftar lokasi
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      const errorMessage =
        err.message || "Terjadi kesalahan yang tidak diketahui.";
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

  return (
    <PageLayout title="Tambah Lokasi Baru">
      {/* Tampilkan error umum dari API jika ada */}
      {submitError && !Object.keys(fieldErrors).length && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
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
