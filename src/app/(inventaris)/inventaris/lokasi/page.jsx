"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";

// Komponen generik
import FilterBarComponent from "@/components/common/FilterBarComponent";
import TableComponent from "@/components/common/TableComponent";
import PageLayout from "@/components/common/PageLayout";
import PaginationComponent from "@/components/common/PaginationComponent";

// MUI Components
import {
  Tooltip,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Service untuk mengambil data
import {
  getPaginatedLocations,
  deleteLocation,
  getAllLocations, // Impor service untuk mendapatkan semua lokasi
} from "@/lib/services/locationServices";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar lokasi inventaris.
 */
export default function InventarisLokasiPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [locations, setLocations] = useState([]); // Data untuk tabel (paginasi)
  const [filterOptions, setFilterOptions] = useState({
    gedung: [],
    lantai: [],
  }); // State baru untuk opsi filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    gedung: "",
    lantai: "",
  });

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
      const response = await getPaginatedLocations({
        page,
        limit,
        filters: currentFilters,
      });
      setLocations(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (err) {
      console.error("Gagal memuat data lokasi:", err);
      setError("Gagal memuat data lokasi. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- PENGAMBILAN OPSI FILTER (HANYA SEKALI) ---
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Ambil SEMUA lokasi hanya untuk mengisi dropdown filter
        const response = await getAllLocations();
        const allData = response.data || [];
        const gedungOpts = [...new Set(allData.map((item) => item.building))];
        const lantaiOpts = [...new Set(allData.map((item) => item.floor))];
        setFilterOptions({ gedung: gedungOpts, lantai: lantaiOpts });
      } catch (err) {
        console.error("Gagal memuat opsi filter:", err);
        // Anda bisa menambahkan state error terpisah untuk ini jika perlu
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch data tabel saat halaman, baris, atau filter berubah
  useEffect(() => {
    // Stringify filters untuk perbandingan yang stabil di dependency array
    const filtersString = JSON.stringify(filters);
    fetchData(
      pagination.currentPage,
      pagination.rowsPerPage,
      JSON.parse(filtersString)
    );
  }, [pagination.currentPage, pagination.rowsPerPage, fetchData, filters]);

  // --- EVENT HANDLERS ---
  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset ke halaman pertama
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: newRowsPerPage > 0 ? newRowsPerPage : prev.totalItems,
      currentPage: 1,
    }));
  };

  const handleAddItem = () => router.push("/inventaris/lokasi/tambah");
  const handleGenerateReport = () => console.log("Membuat laporan lokasi...");
  const handleEdit = (item) =>
    router.push(`/inventaris/lokasi/edit/${item._id}`);

  const handleDelete = async (item) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus lokasi "${item.name}"?`)
    ) {
      try {
        await deleteLocation(item._id);
        alert("Lokasi berhasil dihapus.");
        await fetchData(
          pagination.currentPage,
          pagination.rowsPerPage,
          filters
        );
      } catch (err) {
        setDeleteError(err.message || "Gagal menghapus lokasi.");
      }
    }
  };

  // --- COLUMN & FILTER DEFINITIONS ---
  const columns = [
    {
      id: "no",
      label: "No",
      align: "center",
      renderCell: (row, index) =>
        (pagination.currentPage - 1) * pagination.rowsPerPage + index + 1,
    },
    { id: "building", label: "Gedung" },
    { id: "floor", label: "Lantai" },
    { id: "name", label: "Nama Ruang" },
    { id: "assetCount", label: "Jumlah Aset" },
  ];

  // Konfigurasi dinamis untuk filter bar, sekarang menggunakan state 'filterOptions'
  const filterConfig = useMemo(() => {
    const gedungOptions = filterOptions.gedung.map((g) => ({
      value: g,
      label: `Gedung ${g}`,
    }));
    const lantaiOptions = filterOptions.lantai.map((l) => ({
      value: l,
      label: `Lantai ${l}`,
    }));

    return [
      { name: "name", label: "Cari Nama Ruang", type: "text" },
      {
        name: "gedung",
        label: "Gedung",
        type: "select",
        options: gedungOptions,
      },
      {
        name: "lantai",
        label: "Lantai",
        type: "select",
        options: lantaiOptions,
      },
    ];
  }, [filterOptions]); // Bergantung pada state filterOptions

  const actionButtons = (
    <Box display="flex" gap={2}>
      <Button variant="outlined" onClick={handleGenerateReport}>
        Laporan
      </Button>
      <Button variant="contained" onClick={handleAddItem}>
        + Tambahkan
      </Button>
    </Box>
  );

  return (
    <PageLayout title="Manajemen Lokasi" actionButtons={actionButtons}>
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
      <Divider/>

      <PaginationComponent
        count={pagination.totalPages}
        page={pagination.currentPage}
        rowsPerPage={pagination.rowsPerPage}
        totalItems={pagination.totalItems}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      ) : (
          <TableComponent
            columns={columns}
            data={locations} // Gunakan data paginasi untuk tabel
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
      )}
    </PageLayout>
  );
}
