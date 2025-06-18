"use client"; // Ini adalah Client Component

import * as React from 'react';
import {
  Box, Typography, Button, TextField,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  IconButton, Select, MenuItem, FormControl, InputLabel, InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Untuk mengakses theme
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Untuk ikon dropdown
import DeleteDataModal from '@/components/DeleteDataModal'; // Import komponen modal untuk menghapus data
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Divider from '@mui/material/Divider';




// Ini adalah data dummy untuk tabel
const inventoryData = [
  { id: 'G.A/L/RII/Me005', date: '06/30/2022', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 3, status: 'Baik' },
  { id: 'G.A/L/RII/Me006', date: '06/30/2022', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 3, status: 'Baik' },
  { id: 'G.A/L/RII/Me007', date: '06/30/2022', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 3, status: 'Baik' },
  { id: 'G.A/L/RII/Me008', date: '06/30/2022', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 3, status: 'Baik' },
  // Tambahkan data lainnya sesuai kebutuhan
];

export default function InventarisSementaraPage() {
  const theme = useTheme(); // Akses theme yang sudah didefinisikan

  // State untuk filter dropdown (contoh)
  const [merk, setMerk] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [filter, setFilter] = React.useState('');

  const handleMerkChange = (event) => {
    setMerk(event.target.value);
  };
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [dataToDelete, setDataToDelete] = React.useState(null); // Optional: Jika ada data spesifik yang mau dihapus

  const handleOpenDeleteModal = (item) => { // Fungsi ini dipanggil dari tombol 'hapus' di tabel
    setDataToDelete(item); // Simpan item yang akan dihapus
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDataToDelete(null); // Reset data yang akan dihapus
  };

  const handleDeleteConfirmed = (formData) => {
    // Ini adalah fungsi yang akan dipanggil saat tombol "Hapus" di modal diklik
    console.log('Data yang akan dihapus (dari item terpilih):', dataToDelete);
    console.log('Informasi penghapusan dari form:', formData);

    // --- Lakukan logika penghapusan data Anda di sini ---
    // Contoh: Kirim request API ke backend untuk menghapus item ini
    // fetch('/api/delete-item', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ itemId: dataToDelete?.id, ...formData })
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Berhasil dihapus:', data);
    //   // Refresh data tabel Anda atau tampilkan notifikasi sukses
    // })
    // .catch(error => {
    //   console.error('Gagal menghapus:', error);
    //   // Tampilkan notifikasi error
    // });

    // Setelah proses penghapusan (sukses atau gagal), tutup modal
    handleCloseDeleteModal();
  };

  return (
    // Box utama halaman dengan padding untuk menampung konten di bawah AppBar
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 7, sm: 8 } , display: 'flex', flexDirection: 'column', gap: 4 }}> {/* mt: margin top untuk mengimbangi AppBar */}
      {/* Bagian Atas: Judul dan Tombol Aksi */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Inventaris Tidak Tetap
        </Typography>
        <Box>
          <Button
            variant="outlined"
            sx={{
              color: theme.palette.primary.main, // Warna teks mengikuti primary
              borderColor: theme.palette.primary.main, // Warna border mengikuti primary
              mr: 2,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
              },
            }}
          >
            Laporan
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.primary.main, // Warna background mengikuti primary
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            + Tambahkan
          </Button>
        </Box>
      </Box>
      <Divider flexItem sx={{ bgcolor:theme.palette.secondary.main }}/>
      {/* Bagian Pencarian */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Cari Id Barang"
          variant="outlined"
          size="medium"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

     <DatePicker sx={{ minWidth: '120px' }}/>

        {/* Dropdown Merk */}
        <FormControl sx={{ minWidth: 120 }} size="medium">
          <InputLabel>Merk</InputLabel>
          <Select
            value={merk}
            label="Merk"
            onChange={handleMerkChange}
            IconComponent={ArrowDropDownIcon} // Gunakan ikon dropdown standar MUI
          >
            <MenuItem value="">
              <em>Semua</em>
            </MenuItem>
            <MenuItem value={'Ikea'}>Ikea</MenuItem>
            <MenuItem value={'Informasi'}>Informasi</MenuItem>
            {/* Tambahkan lebih banyak merk */}
          </Select>
        </FormControl>

        {/* Dropdown Status */}
        <FormControl sx={{ minWidth: 120 }} size="medium">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={handleStatusChange}
            IconComponent={ArrowDropDownIcon}
          >
            <MenuItem value="">
              <em>Semua</em>
            </MenuItem>
            <MenuItem value={'Baik'}>Baik</MenuItem>
            <MenuItem value={'Rusak'}>Rusak</MenuItem>
            {/* Tambahkan lebih banyak status */}
          </Select>
        </FormControl>

        {/* Dropdown Filter Umum */}
        <FormControl sx={{ minWidth: 120 }} size="medium">
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={handleFilterChange}
            IconComponent={ArrowDropDownIcon}
          >
            <MenuItem value="">
              <em>Semua</em>
            </MenuItem>
            <MenuItem value={'Filter1'}>Filter 1</MenuItem>
            <MenuItem value={'Filter2'}>Filter 2</MenuItem>
            {/* Tambahkan lebih banyak filter */}
          </Select>
        </FormControl>
      </Box>
      <Divider flexItem sx={{ bgcolor: theme.palette.secondary.main }}/>
      {/* Bagian Tabel Data */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="inventory table">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Id Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nama Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Merk</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tahun di Peroleh</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Jumlah</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryData.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
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
                  <IconButton>
                    <DeleteIcon sx={{ color: theme.palette.danger.main}} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}