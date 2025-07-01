"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Komponen generik
import PageLayout from "@/components/layouts/PageLayout";
import FilterBarComponent from "@/components/common/FilterBarComponent";
import TableComponent from "@/components/common/TableComponent";
import PaginationComponent from "@/components/common/PaginationComponent";

// MUI Components
import {
  Tooltip,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


// Service untuk mengambil data
import { getPaginatedAssets, deleteAsset } from "@/lib/services/assetServices";
import { getAllLocationsForDropdown } from "@/lib/services/locationServices";
import { getAllProductsForDropdown } from "@/lib/services/productServices";
import { useSnackbar } from "@/components/providers/SnackbarProvider";
import { useConfirmation } from "@/components/providers/ConfirmationDialogProvider";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar Aset Tetap secara individual.
 * Halaman ini mendukung pagination, sorting, dan filtering.
 */
export default function DetailAssetPage() {
    const { showSnackbar } = useSnackbar();
    const { showConfirmation } = useConfirmation();

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  

  // PENYESUAIAN: Inisialisasi filter dari URL search params
  const [filters, setFilters] = useState({
    serial_number: searchParams.get("serial_number") || "",
    product: searchParams.get("product") || "",
    location: searchParams.get("location") || "",
    condition: searchParams.get("condition") || "",
  });


  const [filterOptions, setFilterOptions] = useState({
    product: [],
    location: [],
    options: [
      { value: "Baik", label: "Baik" },
      { value: "Kurang Baik", label: "Kurang Baik" },
      { value: "Rusak", label: "Rusak" },
    ],
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    rowsPerPage: 10,
    totalItems: 0,
  });

  // --- PENGAMBILAN DATA ---
  const fetchData = useCallback(async (page, limit, currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      setDeleteError(null);
      const response = await getPaginatedAssets({
        page,
        limit,
        filters: currentFilters,
      });
      setAssets(response.data || []);
      setPagination((prev) => ({
        ...prev,
        ...response.pagination,
        rowsPerPage: limit,
        currentPage: page,
      }));
    } catch (err) {
      console.error("Gagal memuat data aset:", err);
      setError("Gagal memuat data aset. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil data untuk dropdown filter
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [productRes, locationRes] = await Promise.all([
          getAllProductsForDropdown(),
          getAllLocationsForDropdown(),
        ]);
        setFilterOptions((prev) => ({
          ...prev,
          product: productRes.data.map((p) => ({
            value: p._id,
            label: `${p.name} - ${p.brand?.name || "Tanpa Merk"}`,
          })),
          location: locationRes.data.map((l) => ({
            value: l._id,
            label: `G${l.building}/L${l.floor}/Ruang ${l.name}`,
          })),
        }));
      } catch (err) {
        console.error("Gagal memuat opsi filter:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Panggil fetchData setiap kali state pagination atau filter berubah
  useEffect(() => {
    const filtersString = JSON.stringify(filters);
    fetchData(
      pagination.currentPage,
      pagination.rowsPerPage,
      JSON.parse(filtersString)
    );
  }, [pagination.currentPage, pagination.rowsPerPage, filters, fetchData]);

  // --- EVENT HANDLERS ---
  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      currentPage: 1,
    }));
  };

  const handleAddItem = () => router.push("/inventaris-tetap/tambah");
  const handleEdit = (item) => router.push(`/inventaris-tetap/edit/${item._id}`);

  const handleDelete = async (item) => {
    showConfirmation(
          "Konfirmasi Hapus",
          `Apakah Anda yakin ingin menghapus aset dengan nomer seri "${item.serial_number}"?`,
          async () => {
            try {
              await deleteAsset(item._id);
              showSnackbar("Aset berhasil dihapus.", "success");
              fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
            } catch (err) {
              showSnackbar(err.message || "Gagal menghapus aset.", "error");
            }
          }
        );
  };

  // --- COLUMN & FILTER DEFINITIONS ---
  const columns = useMemo(
    () => [
      {
        id: "no",
        label: "No",
        align: "center",
        renderCell: (row, index) =>
          (pagination.currentPage - 1) * pagination.rowsPerPage + index + 1,
      },
      { id: "serial_number", label: "Nomor Seri" },
      {
        id: "product",
        label: "Nama Barang",
        renderCell: (row) => row.product?.name || "-",
      },
      {
        id: "location",
        label: "Lokasi",
        renderCell: (row) => row.location?.name || "-",
      },
      { id: "estimated_price", label: "Harga", renderCell: (row) =>`Rp ${row.estimated_price.toLocaleString("id-ID")}` || "-" },
      { id: "condition", label: "Kondisi" },
    ],
    [pagination.currentPage, pagination.rowsPerPage]
  );

  const filterConfig = useMemo(
    () => [
      { name: "serial_number", label: "Cari Nomor Seri", type: "text" },
      {
        name: "product",
        label: "Produk",
        type: "select",
        options: filterOptions.product,
      },
      {
        name: "location",
        label: "Lokasi",
        type: "select",
        options: filterOptions.location,
      },
      {
        name: "condition",
        label: "Kondisi",
        type: "select",
        options: filterOptions.options,
      },
    ],
    [filterOptions]
  );

  const actionButtons = (
    <Box display="flex" gap={2}>
      <Button variant="contained" onClick={handleAddItem}>
        + Tambah Aset
      </Button>
    </Box>
  );

  return (
    <PageLayout title="Manajemen Aset Tetap" actionButtons={actionButtons}>
      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}
      <FilterBarComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        filterConfig={filterConfig}
      />
      <Divider sx={{ my: 2 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <PaginationComponent
            count={pagination.totalPages}
            page={pagination.currentPage}
            rowsPerPage={pagination.rowsPerPage}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
          <TableComponent
            columns={columns}
            data={assets}
            renderActionCell={(row) => (
              <Box>
                <Tooltip title="Edit Aset">
                  <IconButton onClick={() => handleEdit(row)}>
                    <EditIcon color="action" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Hapus Aset">
                  <IconButton onClick={() => handleDelete(row)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          />
        </>
      )}
    </PageLayout>
  );
}
