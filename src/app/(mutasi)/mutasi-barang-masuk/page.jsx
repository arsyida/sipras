// src/app/mutasi/mutasi-barang-masuk/page.jsx
"use client";

import * as React from 'react';
import ReusableTable from '@/components/ReusableTable';
import DeleteDataModal from '@/components/DeleteDataModal';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Impor ikon hapus

// --- DATA DUMMY UNTUK BARANG MASUK ---
const temporaryInventoryData = [
  { no: '1', gedung: 'Gudang Umum', lantai: '-', ruang: '-', name: 'Kertas HVS', merk: 'PaperOne', year: 2024, jumlah: '50', satuan: 'Rim', status: 'Baik', estimasi: 'Rp 300.000', keterangan: 'Stok ATK', id: 'NA-ATK-001' },
  { no: '2', gedung: 'Kantor TU', lantai: '-', ruang: '-', name: 'Spidol Whiteboard', merk: 'Snowman', year: 2024, jumlah: '100', satuan: 'Pcs', status: 'Baik', estimasi: 'Rp 150.000', keterangan: 'Stok ATK TU', id: 'NA-ATK-002' },
  { no: '3', gedung: 'Lab Bahasa', lantai: 'Lt.1', ruang: 'LB1', name: 'Buku Tulis', merk: 'Sidu', year: 2023, jumlah: '20', satuan: 'Pack', status: 'Rusak', estimasi: 'Rp 50.000', keterangan: 'Rusak kena air', id: 'NA-BUKU-001' },
];


/**
 * Halaman ini menampilkan daftar barang masuk.
 * Halaman ini harus berupa Client Component ("use client") untuk menerima props `filters` dari layout
 * dan me-render ulang tabel saat filter berubah.
 * @param {object} props - Props yang dioper dari layout.
 * @param {object} props.filters - Objek state filter dari layout.
 */
export default function MutasiBarangMasukPage({ filters = {} }) {
  const theme = useTheme();

  // State untuk modal konfirmasi hapus data
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [dataToDelete, setDataToDelete] = React.useState(null);

  const handleOpenDeleteModal = (item) => {
    setDataToDelete(item);
    setOpenDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDataToDelete(null);
  };
  const handleDeleteConfirmed = (formData) => {
    console.log(`Menghapus item ${dataToDelete?.id} (barang masuk) dengan informasi:`, formData);
    // Di sini Anda akan memanggil fungsi API untuk menghapus data
    handleCloseDeleteModal();
  };

  // Mendefinisikan kolom untuk tabel
  const columns = React.useMemo(() => [
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
  ], [theme]);

  // Logika untuk memfilter data berdasarkan props `filters` dari layout
  const filteredData = React.useMemo(() => {
    const { searchQuery, modelFilter, statusFilter } = filters;
    if (!searchQuery && !modelFilter && !statusFilter) {
      return temporaryInventoryData;
    }
    return temporaryInventoryData.filter(item => {
      const matchesSearch = searchQuery ?
        (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      const matchesModel = modelFilter ? item.merk === modelFilter : true;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [filters]);

  return (
    <Box>
      <ReusableTable
        columns={columns}
        data={filteredData}
        ariaLabel={`Tabel Barang Masuk`}
        showActionsColumn={true}
        onActionClick={handleOpenDeleteModal}
        renderActionCell={(row) => (
          <Tooltip title="Hapus Data">
            <IconButton color="error" onClick={() => handleOpenDeleteModal(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      />

      <DeleteDataModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteConfirmed}
      />
    </Box>
  );
}
