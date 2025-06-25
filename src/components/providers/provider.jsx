// src/app/components/providers.jsx
"use client"; // <--- PENTING: TANDAI INI SEBAGAI CLIENT COMPONENT

import * as React from 'react';
import { SessionProvider } from "next-auth/react";
import theme from '@/theme';

// MUI
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// MUI X
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}