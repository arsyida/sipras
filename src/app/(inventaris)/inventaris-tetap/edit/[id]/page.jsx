"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Komponen
import FormComponent from "@/components/common/FormComponent";
import PageLayout from "@/components/layouts/PageLayout";
import { Box, CircularProgress, Alert, Typography, TextField, IconButton, Button } from "@mui/material";
import  AddCircleOutlineIcon  from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";

// Service untuk mengambil dan memperbarui data
import { getAssetById, updateAsset } from "@/lib/services/assetServices";
import { getAllProductsForDropdown } from "@/lib/services/productServices";
import { getAllLocationsForDropdown } from "@/lib/services/locationServices";

/**
 * Halaman untuk mengedit data aset yang sudah ada.
 */
export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id;

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    product: "",
    location: "",
    serial_number: "", // Ditampilkan tapi tidak bisa diedit
    condition: "baik",
    purchase_date: "",
    estimated_price: 0,
    attributes: "", // Akan di-handle sebagai string JSON
  });

  const [attributes, setAttributes] = useState([{ key: "", value: "" }]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formOptions, setFormOptions] = useState({
    product: [],
    location: [],
  });

  // --- PENGAMBILAN DATA AWAL ---
  useEffect(() => {
    if (!assetId) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil data aset dan data untuk dropdown secara bersamaan
        const [assetRes, productRes, locationRes] = await Promise.all([
          getAssetById(assetId),
          getAllProductsForDropdown(),
          getAllLocationsForDropdown(),
        ]);

        // Mengisi form dengan data yang ada dari server
        const assetData = assetRes.data;
        setFormData({
          product: assetData.product?._id || "",
          location: assetData.location?._id || "",
          serial_number: assetData.serial_number || "N/A",
          condition: assetData.condition || "baik",
          purchase_date: assetData.purchase_date
            ? new Date(assetData.purchase_date).toISOString().split("T")[0]
            : "",
          estimated_price: parseFloat(assetData.estimated_price,10) || 0,
          attributes: assetData.attributes
            ? JSON.stringify(assetData.attributes, null, 2)
            : "",
        });

        // Mengisi opsi untuk dropdown
        setFormOptions({
          product: productRes.data,
          location: locationRes.data.map((l) => ({
            value: l._id,
            label: `Gd. ${l.building} - Lt. ${l.floor} - R. ${l.name}`,
          })),
        });
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError(
          "Gagal memuat data aset yang akan diedit. Mungkin data tidak ditemukan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [assetId]);

  // --- KONFIGURASI FORM ---
  const formConfig = useMemo(
    () => [
      {
        name: "serial_number",
        label: "Nomor Seri (Inventaris)",
        type: "text",
        disabled: true,
      },
      {
        name: "product",
        label: "Produk",
        type: "select",
        options: formOptions.product.map((p) => ({
          value: p._id,
          label: `${p.name} - ${p.brand?.name || ""}`,
        })),
        required: true,
        disabled: true, // Produk biasanya tidak diubah
      },
      {
        name: "location",
        label: "Lokasi",
        type: "select",
        options: formOptions.location,
        required: true,
      },
      {
        name: "condition",
        label: "Kondisi",
        type: "select",
        required: true,
        options: [
          { value: "Baik", label: "Baik" },
          { value: "Rusak", label: "Rusak" },
          { value: "Kurang Baik", label: "Kurang Baik" },
        ],
      },
      {
        name: "purchase_date",
        label: "Tahun Perolehan",
        type: "text",
        halfWidth: true,
      },
      {
        name: "estimated_price",
        label: "Estimasi Harga (Rp)",
        type: "number",
        halfWidth: true,
      },
    ],
    [formOptions]
  );

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === "product") {
      const productData = formOptions.product.find((p) => p._id === value);
      setSelectedProduct(productData || null);
      setAttributes([{ key: "", value: "" }]);
    }
  };
  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addAttributeRow = () =>
    setAttributes([...attributes, { key: "", value: "" }]);
  const removeAttributeRow = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  // --- HANDLER UNTUK SUBMIT FORM ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    // Parsing atribut JSON sebelum mengirim
    let parsedAttributes;
    if (formData.attributes) {
      try {
        parsedAttributes = JSON.parse(formData.attributes);
      } catch (e) {
        setFieldErrors({ attributes: ["Format JSON tidak valid."] });
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSubmit = {
      ...formData,
      attributes: parsedAttributes,
      estimated_price: parseFloat(formData.estimated_price,10)
    };
    // Hapus field yang tidak seharusnya diupdate
    delete dataToSubmit.serial_number;
    delete dataToSubmit.product;

    try {
      await updateAsset(assetId, dataToSubmit);
      alert("Aset berhasil diperbarui!");
      router.push("/inventaris-tetap/detail");
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
      const errorMessage =
        err.message || "Terjadi kesalahan yang tidak diketahui.";
      setSubmitError(errorMessage);
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

  if (loading) {
    return (
      <PageLayout title="Memuat Data Aset...">
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Error">
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Edit Aset: ${formData.serial_number}`}>
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
      >
        {selectedProduct?.measurement_unit === "Meter" && (
          <Box mt={3} p={2} border={1} borderColor="grey.300" borderRadius={1}>
            <Typography variant="h6" gutterBottom>
              Atribut Tambahan
            </Typography>
            {attributes.map((attr, index) => (
              <Box display="flex" gap={2} key={index} mb={2}>
                <Box flexGrow={1}>
                  <TextField
                    label="Nama Atribut (cth: panjang)"
                    value={attr.key}
                    onChange={(e) =>
                      handleAttributeChange(index, "key", e.target.value)
                    }
                    fullWidth
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    label="Nilai Atribut (cth: 5.5)"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(index, "value", e.target.value)
                    }
                    fullWidth
                  />
                </Box>
                <Box display="flex" alignItems="center">
                  <IconButton
                    onClick={() => removeAttributeRow(index)}
                    disabled={attributes.length <= 1}
                  >
                    <RemoveCircleOutlineIcon color="error" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={addAttributeRow}
            >
              Tambah Atribut
            </Button>
          </Box>
        )}
      </FormComponent>
    </PageLayout>
  );
}
