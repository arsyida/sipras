"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/common/PageLayout";
import FilterBarComponent from "@/components/common/FilterBarComponent";
import TableComponent from "@/components/common/TableComponent";
import PaginationComponent from "@/components/common/PaginationComponent";
import {
  Tooltip,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getPaginatedCategories,
  deleteCategory,
} from "@/lib/services/categoryServices";

export default function CategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
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

  const fetchData = useCallback(async (page, limit, currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      setDeleteError(null);
      const response = await getPaginatedCategories({
        page,
        limit,
        filters: currentFilters,
      });
      setCategories(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (err) {
      setError("Gagal memuat data kategori.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const filtersString = JSON.stringify(filters);
    fetchData(
      pagination.currentPage,
      pagination.rowsPerPage,
      JSON.parse(filtersString)
    );
  }, [pagination.currentPage, pagination.rowsPerPage, fetchData, filters]);

  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handlePageChange = (event, value) =>
    setPagination((prev) => ({ ...prev, currentPage: value }));
  const handleRowsPerPageChange = (event) =>
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      currentPage: 1,
    }));
  const handleAddItem = () => router.push("/inventaris/kategori/tambah");
  const handleEdit = (item) =>
    router.push(`/inventaris/kategori/edit/${item._id}`);

  const handleDelete = async (item) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${item.name}"?`)) {
      try {
        await deleteCategory(item._id);
        alert("Kategori berhasil dihapus.");
        fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
      } catch (err) {
        setDeleteError(err.message || "Gagal menghapus kategori.");
      }
    }
  };

  const columns = [
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
  ];

  const filterConfig = [
    { name: "name", label: "Cari Nama Kategori", type: "text" },
  ];
  const actionButtons = (
    <Button variant="contained" onClick={handleAddItem}>
      + Tambah Kategori
    </Button>
  );

  return (
    <PageLayout title="Manajemen Kategori" actionButtons={actionButtons}>
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
