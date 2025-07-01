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
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

// Service untuk mengambil data
import { getPaginatedConsumableStock } from "@/lib/services/consumableServices";
import { getAllConsumableProductsForDropdown } from "@/lib/services/consumableServices"; // Menggunakan service yang benar

/**
 * Halaman utama untuk menampilkan dan mengelola daftar Stok Barang Habis Pakai.
 */
export default function ConsumableStockPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    product: "",
    low_stock: false,
  });
  const [filterOptions, setFilterOptions] = useState({
    product: [],
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
      const response = await getPaginatedConsumableStock({
        page,
        limit,
        filters: currentFilters,
      });
      setStock(response.data || []);
      setPagination((prev) => ({
        ...prev,
        ...response.pagination,
        rowsPerPage: limit,
        currentPage: page,
      }));
    } catch (err) {
      console.error("Gagal memuat data stok:", err);
      setError("Gagal memuat data stok. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const productRes = await getAllConsumableProductsForDropdown();
        setFilterOptions({
          product: productRes.data.map((p) => ({
            value: p._id,
            label: `${p.name} (${p.product_code})`,
          })),
        });
      } catch (err) {
        console.error("Gagal memuat opsi filter:", err);
      }
    };
    fetchFilterOptions();
  }, []);

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

  const handleRestock = () =>
    router.push(`/inventaris-sementara/barang-masuk?`);
  const handleUsage = (item) =>
    router.push(`/inventaris-sementara/barang-keluar?stockId=${item._id}`);
  const handleViewLog = () => router.push("/inventaris-sementara/riwayat");

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
      {
        id: "product",
        label: "Nama Barang",
        renderCell: (row) => row.product?.name || "-",
      },
      {
        id: "quantity",
        label: "Jumlah Stok",
        align: "center",
        renderCell: (row) => `${row.quantity} ${row.unit}`,
      },
      { id: "reorder_point", label: "Batas Minimum Stok", align: "center" },
    ],
    [pagination.currentPage, pagination.rowsPerPage]
  );

  const filterConfig = useMemo(
    () => [
      {
        name: "product",
        label: "Produk",
        type: "select",
        options: filterOptions.product,
      },
      {
        name: 'low_stock',
        label: 'Tampilkan Stock Sedikit',
        type: 'checkbox',
      }
    ],
    [filterOptions]
  );

  const actionButtons = (
    <Box display="flex" gap={2}>
      <Button
        variant="outlined"
        startIcon={<HistoryIcon />}
        onClick={handleViewLog}
      >
        Riwayat
      </Button>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleRestock}
      >
        Barang Masuk
      </Button>
    </Box>
  );

  return (
    <PageLayout title="Inventaris Sementara" actionButtons={actionButtons}>
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
            data={stock}
            renderActionCell={(row) => (
              <Box>
                <Tooltip title="Ambil/Gunakan Stok">
                  <IconButton onClick={() => handleUsage(row)} color="warning">
                    <UploadIcon color="error" />
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
