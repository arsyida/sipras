"use client";

import * as React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Komponen header halaman yang menampilkan judul dan area untuk tombol aksi.
 * @param {string} title - Judul halaman yang akan ditampilkan.
 * @param {React.ReactNode} actions - Komponen React (misalnya, beberapa Button) yang akan dirender di sisi kanan.
 */
export default function HeaderComponent({ title, actions }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      
      {/* Area untuk merender tombol atau aksi lainnya */}
      {actions && (
        <Box>
          {actions}
        </Box>
      )}
    </Box>
  );
}
