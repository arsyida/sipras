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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Service untuk mengambil data
import {
  getPaginatedBrands,
  deleteBrand,
} from "@/lib/services/brandServices";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar Merk.
 */
export default function BrandPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
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
      setDeleteError(null);
      const response = await getPaginatedBrands({
        page,
        limit,
        filters: currentFilters,
      });
      setBrands(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination, rowsPerPage: limit, currentPage: page }));
    } catch (err) {
      console.error("Gagal memuat data merk:", err);
      setError("Gagal memuat data merk. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data saat halaman, baris, atau filter berubah
  useEffect(() => {
    // Menggunakan JSON.stringify untuk perbandingan stabil pada objek filter
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
      rowsPerPage: event.target.value === "Semua" ? pagination.totalItems : parseInt(event.target.value, 10),
      currentPage: 1,
    }));
  };

  const handleAddItem = () => router.push("/inventaris-tetap/merk/tambah");
  const handleEdit = (item) => router.push(`/inventaris-tetap/merk/edit/${item._id}`);

  const handleDelete = async (item) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus merk "${item.name}"?`)
    ) {
      try {
        setDeleteError(null);
        await deleteBrand(item._id);
        alert("Merk berhasil dihapus.");
        // Refresh data di halaman saat ini
        fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
      } catch (err) {
        setDeleteError(
          err.message ||
            "Gagal menghapus merk. Mungkin merk masih digunakan oleh produk lain."
        );
      }
    }
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
    { id: "name", label: "Nama Merk" },
    { id: "productCount", label: "Jumlah Produk", renderCell: (row) => row.productCount || 0 },
    {
      id: "description",
      label: "Deskripsi",
      renderCell: (row) => row.description || "-",
    },
  ], [pagination.currentPage, pagination.rowsPerPage]);

  const filterConfig = [
    { name: "name", label: "Cari Nama Merk", type: "text" },
  ];

  const actionButtons = (
    <Box display="flex" gap={2}>
      <Button variant="contained" onClick={handleAddItem}>
        + Tambahkan
      </Button>
    </Box>
  );

  return (
    <PageLayout title="Manajemen Merk" actionButtons={actionButtons}>
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

      <Divider sx={{ my: 2 }}/>
      
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
            data={brands}
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
