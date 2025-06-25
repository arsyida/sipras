"use client";

import * as React from 'react';
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  IconButton, Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';

// Komponen Tabel yang dapat digunakan kembali
export default function InventoryTable({ data, onInfoClick, onOpenDeleteModal }) {
  const theme = useTheme();

  // Definisikan header tabel secara statis atau bisa juga via props jika dinamis
  const headers = [
    'Id Barang', 'Tanggal', 'Nama Barang', 'Merk', 'Tahun di Peroleh', 'Jumlah', 'Status', 'Aksi'
  ];

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="inventory table">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
            {headers.map((header) => (
              <TableCell key={header} sx={{ fontWeight: 'bold' }} align={header === 'Aksi' ? 'center' : 'left'}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">{row.id}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.merk}</TableCell>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    color: row.status === 'Baik' ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 'bold'
                  }}
                >
                  {row.status}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={() => onInfoClick(row)}>
                  <InfoIcon sx={{ color: theme.palette.info.main }} />
                </IconButton>
                {/* Anda bisa tambahkan tombol hapus di sini jika diinginkan */}
                {/* <IconButton onClick={() => onOpenDeleteModal(row)}>
                  <DeleteIcon sx={{ color: theme.palette.error.main }} />
                </IconButton> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}