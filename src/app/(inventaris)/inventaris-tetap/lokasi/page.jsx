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
  Divider,
  Button,
} from "@mui/material";

// MUI Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Service untuk mengambil data
import {
  getPaginatedLocations,
  deleteLocation,
  getAllLocationsForDropdown,
} from "@/lib/services/locationServices";

/**
 * Halaman utama untuk menampilkan dan mengelola daftar lokasi inventaris.
 * Strukturnya disesuaikan agar sama dengan ProductPage (tanpa custom hook).
 */
export default function InventarisLokasiPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  // Semua state dikelola langsung di dalam komponen ini.
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    building: "",
    floor: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    building: [],
    floor: [],
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    rowsPerPage: 10,
    totalItems: 0,
  });

  // --- PENGAMBILAN DATA ---
  // Fungsi untuk mengambil data, dibungkus dengan useCallback.
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
      // Perbarui pagination dari data API, tapi pertahankan rowsPerPage dari state
      setPagination((prev) => ({ 
          ...prev, 
          ...response.pagination, 
          rowsPerPage: limit // Pastikan rowsPerPage juga update
      }));
    } catch (err) {
      console.error("Gagal memuat data lokasi:", err);
      setError("Gagal memuat data lokasi. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil opsi filter hanya sekali saat komponen dimuat.
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await getAllLocationsForDropdown();
        const allData = response.data || [];
        const buildingOpts = [...new Set(allData.map((item) => item.building))];
        const floorOpts = [...new Set(allData.map((item) => item.floor))];
        setFilterOptions({ building: buildingOpts, floor: floorOpts });
      } catch (err) {
        console.error("Gagal memuat opsi filter:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // useEffect sekarang menjadi satu-satunya pemicu untuk fetchData.
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
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset ke halaman pertama
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: event.target.value === "Semua" 
      ? pagination.totalItems // PERBAIKAN: Menggunakan 'totalAssets' dari hook
      : parseInt(event.target.value, 10),
      currentPage: 1, // Selalu kembali ke halaman 1
    }));
  };
  
  const handleAddItem = () => router.push("/inventaris-tetap/lokasi/tambah");
  const handleGenerateReport = () => console.log("Membuat laporan lokasi...");
  const handleEdit = (item) => router.push(`/inventaris-tetap/lokasi/edit/${item._id}`);

  const handleDelete = async (item) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus lokasi "${item.name}"?`)) {
      try {
        setDeleteError(null);
        await deleteLocation(item._id);
        alert("Lokasi berhasil dihapus.");
        // Panggil kembali fetchData untuk me-refresh tabel setelah hapus.
        fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
      } catch (err) {
        setDeleteError(err.message || "Gagal menghapus lokasi.");
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
    { id: "building", label: "Gedung" },
    { id: "floor", label: "Lantai" },
    { id: "name", label: "Nama Ruang" },
  ], [pagination.currentPage, pagination.rowsPerPage]);
  
  const filterConfig = useMemo(() => {
    const buildingOpts = filterOptions.building.map((g) => ({ value: g, label: `Gedung ${g}` }));
    const floorOptions = filterOptions.floor.map((l) => ({ value: l, label: `Lantai ${l}` }));
    return [
      { name: "name", label: "Cari Nama Ruang", type: "text" },
      { name: "building", label: "Gedung", type: "select", options: buildingOpts },
      { name: "floor", label: "Lantai", type: "select", options: floorOptions },
    ];
  }, [filterOptions]);

  const actionButtons = (
    <Box display="flex" gap={2}>
      <Button variant="outlined" onClick={handleGenerateReport}>Laporan</Button>
      <Button variant="contained" onClick={handleAddItem}>+ Tambahkan</Button>
    </Box>
  );

  return (
    <PageLayout title="Manajemen Lokasi" actionButtons={actionButtons}>
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
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
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
      ) : (
        <TableComponent
          columns={columns}
          data={locations}
          renderActionCell={(row) => (
            <Box>
              <Tooltip title="Edit"><IconButton onClick={() => handleEdit(row)}><EditIcon color="action" /></IconButton></Tooltip>
              <Tooltip title="Hapus"><IconButton onClick={() => handleDelete(row)}><DeleteIcon color="error" /></IconButton></Tooltip>
            </Box>
          )}
        />
      )}
    </PageLayout>
  );
}
