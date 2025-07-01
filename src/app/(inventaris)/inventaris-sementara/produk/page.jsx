"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

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

// Service & Hooks
import {
  getPaginatedConsumableProducts,
  deleteConsumableProduct,
} from "@/lib/services/consumableServices";
import { getAllCategoriesForDropdown } from "@/lib/services/categoryServices";
import { useConfirmation } from "@/components/providers/ConfirmationDialogProvider";
import { useSnackbar } from "@/components/providers/SnackbarProvider";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar Produk Habis Pakai.
 */
export default function ConsumableProductPage() {
  const router = useRouter();
  const { showConfirmation } = useConfirmation();
  const { showSnackbar } = useSnackbar();

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: "", category: "" });
  const [filterOptions, setFilterOptions] = useState({ category: [] });
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
      const response = await getPaginatedConsumableProducts({
        page,
        limit,
        filters: currentFilters,
      });
      setProducts(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination, rowsPerPage: limit, currentPage: page }));
    } catch (err) {
      console.error("Gagal memuat data produk:", err);
      setError("Gagal memuat data produk habis pakai. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil data untuk dropdown filter
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const categoryRes = await getAllCategoriesForDropdown();
        setFilterOptions({
          category: categoryRes.data.map((c) => ({
            value: c._id,
            label: c.name,
          })),
        });
      } catch (err) {
        console.error("Gagal memuat opsi filter:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch data tabel setiap kali ada perubahan
  useEffect(() => {
    fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
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

  const handleAddItem = () => router.push("/inventaris-tidak-tetap/produk/tambah");
  const handleEdit = (item) => router.push(`/inventaris-tidak-tetap/produk/edit/${item._id}`);

  const handleDelete = (item) => {
    showConfirmation(
      "Konfirmasi Hapus",
      `Yakin ingin menghapus produk "${item.name}"? Ini tidak akan menghapus data stok yang sudah ada, tetapi produk ini tidak bisa lagi ditambahkan.`,
      async () => {
        try {
          await deleteConsumableProduct(item._id);
          showSnackbar("Produk berhasil dihapus.", "success");
          fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
        } catch (err) {
          showSnackbar(err.message || "Gagal menghapus produk.", "error");
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
      renderCell: (row, index) => (pagination.currentPage - 1) * pagination.rowsPerPage + index + 1,
    },
    { id: "product_code", label: "Kode Produk" },
    { id: "name", label: "Nama Produk" },
    { id: "category", label: "Kategori", renderCell: (row) => row.category?.name || "-" },
    { id: "stockCount", label: "Jumlah Stok", align: "center", renderCell: (row) => `${row.stockCount || 0} ${row.measurement_unit}` },
  ], [pagination.currentPage, pagination.rowsPerPage]);

  const filterConfig = useMemo(() => [
    { name: "name", label: "Cari Nama Produk", type: "text" },
    { name: "category", label: "Kategori", type: "select", options: filterOptions.category },
  ], [filterOptions]);

  const actionButtons = (
    <Button variant="contained" onClick={handleAddItem}>
      + Tambah Produk
    </Button>
  );

  return (
    <PageLayout title="Manajemen Produk Habis Pakai" actionButtons={actionButtons}>
      <FilterBarComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        filterConfig={filterConfig}
      />
      <Divider sx={{ my: 2 }} />
      
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
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
            data={products}
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
