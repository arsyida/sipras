"use client";

import * as React from 'react';
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Box, Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Komponen tabel dinamis yang bisa digunakan kembali di seluruh aplikasi.
 * @param {array} columns - Definisi kolom. Setiap objek harus punya 'id' dan 'label'. Bisa punya 'renderCell'.
 * @param {array} data - Array data yang akan ditampilkan.
 * @param {function} renderActionCell - Fungsi untuk merender sel aksi di setiap baris.
 */
export default function TableComponent({ columns, data, renderActionCell }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ textAlign: 'center', p: 5, mt: 2 }}>
        <Typography color="text.secondary">Tidak ada data untuk ditampilkan.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }} aria-label="dynamic table">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
            {columns.map((column) => (
              <TableCell key={column.id} sx={{ fontWeight: 'bold' }}>
                {column.label}
              </TableCell>
            ))}
            {/* Render header untuk kolom Aksi jika ada */}
            {renderActionCell && (
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Aksi</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {/* Gunakan renderCell jika ada, jika tidak, tampilkan data biasa */}
                  {column.renderCell ? column.renderCell(row) : row[column.id]}
                </TableCell>
              ))}
              {/* Render sel untuk kolom Aksi jika ada */}
              {renderActionCell && (
                <TableCell align="center">
                  {renderActionCell(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
