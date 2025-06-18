"use client"; // Ini adalah Client Component

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; // Untuk layout dan spasi
import { useTheme } from '@mui/material/styles'; // Untuk mengakses theme (warna)
import PropTypes from 'prop-types';

export default function DeleteDataModal(props) {
  const { open, onClose, onDelete } = props; // Props: open, onClose, onDelete
  const theme = useTheme();

  // State untuk menyimpan nilai input
  const [nama, setNama] = React.useState('');
  const [jabatan, setJabatan] = React.useState('');
  const [keterangan, setKeterangan] = React.useState('');
  const [keperluan, setKeperluan] = React.useState('');

  // Reset form saat modal dibuka/ditutup
  React.useEffect(() => {
    if (!open) {
      setNama('');
      setJabatan('');
      setKeterangan('');
      setKeperluan('');
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Panggil fungsi onDelete yang diteruskan dari parent, dengan data form
    onDelete({ nama, jabatan, keterangan, keperluan });
    onClose(); // Tutup modal setelah submit
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: 'center', pb: 0, pt: 3, fontWeight: 'bold', fontSize: '1.5rem' }}>
        Hapus Data
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Input Nama */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="nama"
            label="Nama"
            name="nama"
            variant="outlined"
            size="medium"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Input Jabatan */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="jabatan"
            label="Jabatan"
            name="jabatan"
            variant="outlined"
            size="medium"
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Input Keterangan */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="keterangan"
            label="Keterangan"
            name="keterangan"
            variant="outlined"
            size="medium"
            multiline // Memungkinkan input multi-baris
            rows={2}   // Jumlah baris default
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Input Keperluan */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="keperluan"
            label="Keperluan"
            name="keperluan"
            variant="outlined"
            size="medium"
            multiline // Memungkinkan input multi-baris
            rows={2}   // Jumlah baris default
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            sx={{ mb: 4 }} // Spasi lebih besar sebelum tombol
          />

          {/* Tombol Hapus */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.error.main, // Warna merah untuk aksi hapus
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
              fontWeight: 'bold',
            }}
          >
            Hapus
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// Tambahkan PropTypes untuk validasi props
DeleteDataModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired, // Menerima data form: { nama, jabatan, keterangan, keperluan }
};