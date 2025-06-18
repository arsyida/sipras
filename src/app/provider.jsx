// src/app/providers.jsx
"use client"; // <--- PENTING: TANDAI INI SEBAGAI CLIENT COMPONENT

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme'; // Pastikan path ke theme.js Anda benar

// Import untuk Date Pickers (AdapterDayjs adalah fungsi/kelas)
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // <--- AdapterDayjs DIIMPOR DI SINI

export default function MuiProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline mereset CSS browser */}
      <CssBaseline />
      {/* LocalizationProvider dan AdapterDayjs sepenuhnya berada di Client Component */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}