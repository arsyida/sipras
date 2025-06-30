"use client";

import * as React from 'react';
import { Box, Divider } from '@mui/material';
import BreadcrumbsComponent from '@/components/common/BreadcrumbsComponent';
import HeaderComponent from '@/components/common/HeaderComponent';

/**
 * Komponen layout utama untuk halaman.
 * @param {string} title - Judul halaman.
 * @param {React.ReactNode} actionButtons - Tombol-tombol aksi yang akan ditampilkan di header.
 * @param {React.ReactNode} children - Konten utama dari halaman.
 */
export default function PageLayout({ title, actionButtons, children }) {
  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ p: 3 }}>
      <BreadcrumbsComponent />

      {/* Menggunakan komponen HeaderComponent yang sudah dipisah */}
      <HeaderComponent title={title} actions={actionButtons} />

      <Divider />
      
      {/* Konten utama halaman */}
      {children}
    </Box>
  );
}
