"use client";

import * as React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function InventoryPageLayout({ title, onAdd, onGenerateReport, children }) {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 7, sm: 8 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Bagian Atas: Judul dan Tombol Aksi */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={onGenerateReport}
            sx={{
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              mr: 2,
              '&:hover': { borderColor: theme.palette.primary.dark },
            }}
          >
            Laporan
          </Button>
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}
          >
            + Tambahkan
          </Button>
        </Box>
      </Box>
      
      <Divider flexItem sx={{ bgcolor: theme.palette.secondary.main }} />

      {/* Konten (Filter dan Tabel) akan dirender di sini */}
      {children}
    </Box>
  );
}