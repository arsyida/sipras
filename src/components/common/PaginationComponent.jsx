"use client";

import React from 'react';
import { Box, FormControl, Select, MenuItem, Typography, Pagination } from '@mui/material';

/**
 * Komponen paginasi reusable dengan opsi untuk mengubah jumlah baris per halaman.
 * @param {number} count - Jumlah total halaman.
 * @param {number} page - Halaman yang sedang aktif.
 * @param {number} rowsPerPage - Jumlah item yang ditampilkan per halaman.
 * @param {number} totalItems - Jumlah total semua item.
 * @param {function} onPageChange - Handler saat halaman diubah.
 * @param {function} onRowsPerPageChange - Handler saat jumlah baris per halaman diubah.
 */
export default function PaginationComponent({
  count,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}) {

  // --- PERBAIKAN LOGIKA TAMPILAN ---
  const firstItem = Math.min((page - 1) * (rowsPerPage > 0 ? rowsPerPage : 0) + 1, totalItems);
  const lastItem = rowsPerPage > 0 ? Math.min(page * rowsPerPage, totalItems) : totalItems;

  return (
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      {/* Kiri: Pilihan Baris & Info Data */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Baris per halaman:
        </Typography>
        <FormControl size="small" variant="outlined">
          <Select
            value={rowsPerPage > 50 ? "Semua" : rowsPerPage}
            onChange={onRowsPerPageChange}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={"Semua"}>Semua</MenuItem>
          </Select>
        </FormControl>
        {totalItems > 0 && (
          <Typography variant="body2" color="text.secondary">
            {`Menampilkan ${firstItem + lastItem - 1} dari ${totalItems}`}
          </Typography>
        )}
      </Box>

      {/* Kanan: Navigasi Halaman */}
      {count > 1 && (
         <Pagination
            count={count}
            page={page}
            onChange={onPageChange}
            color="primary"
            shape="rounded"
        />
      )}
    </Box>
  );
}
