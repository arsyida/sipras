// src/app/inventaris/tetap/page.jsx (atau halaman daftar utama Anda)
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import ReusableTable from '@/components/ReusableTable';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// Asumsikan ini data Anda untuk inventaris tetap
const fixedInventoryData = [
  { no: '1', gedung: 'Gedung A', lantai: 'Lt.3', ruang: 'A3', name: 'Meja Laboratorium', merk: 'LabPro', year: 2023, jumlah: '5', satuan: 'Unit', status: 'Baik', id: 'FA-LAB-001' },
  { no: '2', gedung: 'Gedung A', lantai: 'Lt.3', ruang: 'A3', name: 'Kursi Laboratorium', merk: 'LabPro', year: 2023, jumlah: '10', satuan: 'Unit', status: 'Baik', id: 'FA-LAB-004' },
  { no: '3', gedung: 'Gedung A', lantai: 'Lt.2', ruang: 'A2', name: 'Proyektor', merk: 'Epson', year: 2024, jumlah: 2, satuan: 'Unit', status: 'Rusak', id: 'FA-LAB-003' },
];

export default function InventarisTetapPage({ filters = {} }) {
  const theme = useTheme();
  const router = useRouter();

  /**
   * Fungsi ini membuat URL dengan query string berdasarkan lokasi item,
   * lalu mengarahkan pengguna ke halaman detail lokasi.
   * @param {object} item - Data baris yang diklik.
   */
  const handleDelete = (item) => {
    // Di sini Anda bisa menambahkan logika untuk menghapus item
    console.log(`Menghapus item dengan ID: ${item.id}`);
    // Contoh: panggil API untuk menghapus data
  };

  // Definisi kolom (bisa disesuaikan)
  const columns = [
    { id: 'no', label: 'No' },
    { id: 'name', label: 'Nama Barang' },
    { id: 'gedung', label: 'Gedung' },
    { id: 'lantai', label: 'Lantai' },
    { id: 'ruang', label: 'Ruang' },
    { id: 'status', label: 'Status' },
  ];

  // Logika filter Anda untuk halaman ini tetap sama...
  const filteredData = React.useMemo(() => {
    // ...logika filter Anda berdasarkan props 'filters'
    return fixedInventoryData;
  }, [filters]);

  return (
    <Box>
      <ReusableTable
        columns={columns}
        data={filteredData}
        ariaLabel={`Tabel Inventaris Tetap`}
        showActionsColumn={true}
        renderActionCell={(row) => (
          <Tooltip title="Hapus Barang Ini">
            <IconButton color="primary" onClick={() => handleDelete(row)}>
              <DeleteIcon sx={{ color: theme.palette.error.main }} />
            </IconButton>
          </Tooltip>
        )}
      />
    </Box>
  );
}
