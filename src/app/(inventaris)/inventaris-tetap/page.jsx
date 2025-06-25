// src/app/inventaris/tetap/page.jsx
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import ReusableTable from '@/components/ReusableTable';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

// --- DATA DUMMY (dengan beberapa data duplikat untuk demonstrasi agregasi) ---
const fixedInventoryData = [
  { no: '1', gedung: '06/30/2022', lantai: 'lt3', ruang: 'A3', name: 'Meja Belajar', merk: 'Ikea', year: 2022, jumlah: '3', satuan: 'Pcs', status: 'Baik', estimasi: 'Rp.500', keterangan: '-' },
  { no: '2', gedung: '06/30/2022', lantai: 'lt3', ruang: 'A3', name: 'Meja Belajar', merk: 'Ikea', year: 2022, jumlah: '3', satuan: 'Pcs', status: 'Baik', estimasi: 'Rp.500', keterangan: '-' },
  { no: '3', gedung: '06/30/2022', lantai: 'lt3', ruang: 'A3', name: 'Meja Belajar', merk: 'Ikea', year: 2022, jumlah: '3', satuan: 'Pcs', status: 'Baik', estimasi: 'Rp.500', keterangan: '-' },
  { no: '4', gedung: '06/30/2022', lantai: 'lt3', ruang: 'A3', name: 'Meja Belajar', merk: 'Ikea', year: 2022, jumlah: '3', satuan: 'Pcs', status: 'Baik', estimasi: 'Rp.500', keterangan: '-' },
  // Tambahkan data lainnya sesuai kebutuhan
];

/**
 * Halaman Agregat untuk Inventaris Tetap.
 * Mengelompokkan dan menjumlahkan aset yang sama di lokasi yang sama.
 */
export default function InventarisTetapAggregatePage({ filters = {} }) {
  const theme = useTheme();
  const router = useRouter();

  const handleNavigateToLocationDetail = (item) => {
    const query = new URLSearchParams({
      gedung: item.gedung,
      lantai: item.lantai,
      ruang: item.ruang,
    }).toString();
    router.push(`/inventaris-tetap/detail?${query}`);
  };

  // --- LOGIKA UTAMA: AGREGASI DATA ---
  const aggregatedData = React.useMemo(() => {
    // Gunakan objek untuk menampung hasil agregasi
    const aggregationMap = {};

    fixedInventoryData.forEach(item => {
      // Buat kunci unik berdasarkan nama barang dan lokasi
      const key = `${item.name}-${item.gedung}-${item.lantai}-${item.ruang}`;
      
      if (aggregationMap[key]) {
        // Jika sudah ada, tambahkan jumlahnya
        aggregationMap[key].jumlah += parseInt(item.jumlah, 10);
      } else {
        // Jika belum ada, buat entri baru
        aggregationMap[key] = {
          ...item, // Salin semua properti
          jumlah: parseInt(item.jumlah, 10), // Ubah jumlah menjadi angka
        };
      }
    });

    // Ubah kembali map menjadi array untuk ditampilkan di tabel
    return Object.values(aggregationMap);
  }, []); // Hanya dijalankan sekali

  // Kolom untuk tabel agregat
  const columns = React.useMemo(() => {
    let commonColumns = [
      { id: 'no', label: 'No' },
      { id: 'gedung', label: 'Gedung' },
      { id: 'lantai', label: 'Lantai' },
      { id: 'ruang', label: 'Ruang' },
      { id: 'name', label: 'Nama Barang' },
      { id: 'merk', label: 'Merk' },
      { id: 'year', label: 'Tahun Peroleh' },
      { id: 'jumlah', label: 'Jumlah' },
      { id: 'satuan', label: 'Satuan' },
      {
        id: 'status',
        label: 'Status',
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              color: row.status === 'Baik' ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 'bold'
            }}
          >
            {row.status}
          </Typography>
        )
      },
      { id: 'estimasi', label: 'Estimasi' },
      { id: 'keterangan', label: 'Keterangan' },
    ];
    return commonColumns;
  }, [theme]);


  // Filter data yang sudah diagregasi (jika diperlukan)
  const filteredData = React.useMemo(() => {
    const { searchQuery } = filters;
    if (!searchQuery) {
        return aggregatedData;
    }
    return aggregatedData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [aggregatedData, filters]);

  return (
    <Box>
      <ReusableTable
        columns={columns}
        data={filteredData}
        ariaLabel={`Tabel Agregat Inventaris Tetap`}
        showActionsColumn={true}
        renderActionCell={(row) => (
          <Tooltip title="Lihat Semua Barang di Lokasi Ini">
            <IconButton color="primary" onClick={() => handleNavigateToLocationDetail(row)}>
              <InfoIcon sx={{ color: theme.palette.info.main }} />
            </IconButton>
          </Tooltip>
        )}
      />
    </Box>
  );
}
