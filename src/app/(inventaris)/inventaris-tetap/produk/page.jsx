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
  getPaginatedProducts,
  deleteProduct,
} from "@/lib/services/productServices";
import { getAllBrandsForDropdown } from "@/lib/services/brandServices";
import { getAllCategoriesForDropdown } from "@/lib/services/categoryServices";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar Produk.
 */
export default function ProductPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [filters, setFilters] = useState({ name: "", brand: "", category: "" });
  const [filterOptions, setFilterOptions] = useState({
    brand: [],
    category: [],
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
      const response = await getPaginatedProducts({
        page,
        limit,
        filters: currentFilters,
      });
      setProducts(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination, rowsPerPage: limit, currentPage: page }));
    } catch (err) {
      console.error("Gagal memuat data produk:", err);
      setError("Gagal memuat data produk. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil opsi untuk dropdown filter saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [brandRes, categoryRes] = await Promise.all([
          getAllBrandsForDropdown(),
          getAllCategoriesForDropdown(),
        ]);
        setFilterOptions({
          brand: brandRes.data.map((b) => ({ value: b._id, label: b.name })),
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

  // Panggil fetchData setiap kali ada perubahan pada pagination atau filter
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
      rowsPerPage: event.target.value === "Semua" ? pagination.totalItems : parseInt(event.target.value, 10),
      currentPage: 1,
    }));
  };

  const handleAddItem = () => router.push("/inventaris-tetap/produk/tambah");
  const handleEdit = (item) => router.push(`/inventaris-tetap/produk/edit/${item._id}`);

  const handleDelete = async (item) => {
    if (window.confirm(`Yakin ingin menghapus produk "${item.name} - ${item.brand?.name || ''}"?`)) {
      try {
        setDeleteError(null);
        await deleteProduct(item._id);
        alert("Produk berhasil dihapus.");
        fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
      } catch (err) {
        setDeleteError(err.message || "Gagal menghapus produk.");
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
    { id: "product_code", label: "Kode" },
    { id: "name", label: "Nama Produk" },
    { id: "brand", label: "Merk", renderCell: (row) => row.brand?.name || "-" },
    { id: "category", label: "Kategori", renderCell: (row) => row.category?.name || "-" },
    { id: "measurement_unit", label: "Satuan" },
    { id: "assetCount", label: "Jumlah Aset", align: "center", renderCell: (row) => row.assetCount || 0 },
  ], [pagination.currentPage, pagination.rowsPerPage]);

  const filterConfig = useMemo(() => [
    { name: "name", label: "Cari Nama Produk", type: "text" },
    {
      name: "brand",
      label: "Merk",
      type: "select",
      options: filterOptions.brand,
    },
    {
      name: "category",
      label: "Kategori",
      type: "select",
      options: filterOptions.category,
    },
  ], [filterOptions]);

  const actionButtons = (
    <Button variant="contained" onClick={handleAddItem}>
      + Tambah Produk
    </Button>
  );

  return (
    <PageLayout title="Manajemen Produk" actionButtons={actionButtons}>
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
