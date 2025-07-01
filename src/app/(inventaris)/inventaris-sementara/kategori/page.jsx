"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";

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

// MUI Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Service untuk mengambil data
import {
  getPaginatedCategories,
  deleteCategory,
} from "@/lib/services/categoryServices";

// Import hook untuk notifikasi dan konfirmasi
import { useSnackbar } from "@/components/providers/SnackbarProvider";
import { useConfirmation } from "@/components/providers/ConfirmationDialogProvider";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar Kategori.
 */
export default function CategoryPage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { showConfirmation } = useConfirmation();

  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: "" });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    rowsPerPage: 10,
  });

  // --- PENGAMBILAN DATA ---
  const fetchData = useCallback(async (page, limit, currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginatedCategories({
        page,
        limit,
        filters: currentFilters,
      });
      setCategories(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination, rowsPerPage: limit, currentPage: page }));
    } catch (err) {
      console.error("Gagal memuat data kategori:", err);
      setError("Gagal memuat data kategori. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data saat halaman, baris, atau filter berubah
  useEffect(() => {
    const filtersString = JSON.stringify(filters);
    fetchData(
      pagination.currentPage,
      pagination.rowsPerPage,
      JSON.parse(filtersString)
    );
  }, [pagination.currentPage, pagination.rowsPerPage, fetchData, filters]);

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
      rowsPerPage: event.target.value === "Semua" ? pagination.totalItems : parseInt(event.target.value, 10),
      currentPage: 1,
    }));
  };

  const handleAddItem = () => router.push("/inventaris-sementara/kategori/tambah");
  const handleEdit = (item) => router.push(`/inventaris-sementara/kategori/edit/${item._id}`);

  const handleDelete = (item) => {
    showConfirmation(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus kategori "${item.name}"?`,
      async () => {
        try {
          await deleteCategory(item._id);
          showSnackbar("Kategori berhasil dihapus.", "success");
          fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
        } catch (err) {
          showSnackbar(err.message || "Gagal menghapus kategori.", "error");
        }
      }
    );
  };

  // --- COLUMN & FILTER DEFINITIONS ---
  const columns = useMemo(() => [
    {
      id: "no",
      label: "No",
      align: "center",
      renderCell: (row, index) =>
        (pagination.currentPage - 1) * pagination.rowsPerPage + index + 1,
    },
    { id: "name", label: "Nama Kategori" },
    {
      id: "description",
      label: "Deskripsi",
      renderCell: (row) => row.description || "-",
    },
    {
        id: "productCount",
        label: "Jumlah Produk",
        align: "center",
        renderCell: (row) => row.productCount || 0,
    }
  ], [pagination.currentPage, pagination.rowsPerPage]);

  const filterConfig = [
    { name: "name", label: "Cari Nama Kategori", type: "text" },
  ];

  const actionButtons = (
    <Box display="flex" gap={2}>
      <Button variant="contained" onClick={handleAddItem}>
        + Tambah Kategori
      </Button>
    </Box>
  );

  return (
    <PageLayout title="Manajemen Kategori" actionButtons={actionButtons}>
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
            data={categories}
            renderActionCell={(row) => (
              <Box>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEdit(row)}>
                    <EditIcon color="action" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Hapus">
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
  