"use client";

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Impor semua provider kustom Anda di sini
import { SnackbarProvider } from './SnackbarProvider';
import { ConfirmationDialogProvider } from './ConfirmationDialogProvider';
import AppLayout from '@/components/layouts/AppLayout'; // Impor AppLayout
import theme from '@/theme';

/**
 * Komponen tunggal untuk membungkus semua context provider aplikasi.
 */
export default function Providers({ children }) {
  return (
    // Urutan dari luar ke dalam
    <SessionProvider>
      <SnackbarProvider>
        <ConfirmationDialogProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {/* AppLayout sekarang berada di dalam semua provider */}
              <AppLayout>
                {children}
              </AppLayout>
            </LocalizationProvider>
          </ThemeProvider>
        </ConfirmationDialogProvider>
      </SnackbarProvider>
    </SessionProvider>
  );
}
