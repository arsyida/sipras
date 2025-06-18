// src/theme.js
"use client"; // This file is a theme configuration for Material-UI in a Next.js application.
import {Inter} from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const inter = Inter({ 
  weight: ['300','400', '500', '600', '700'], 
  subsets: ['latin'], 
  display: 'swap'
});

const theme = createTheme({
  typography: {
    fontFamily: inter.style.fontFamily, // Menggunakan font Inter
  },

  palette: {
    primary: {
      main: '#7E136D', // ungu gelap
      contrastText: '#fff', // Warna teks yang kontras dengan warna primer
    },

    secondary: {
      main: '#FECE1F', // kuning
      contrastText: '#000', // Warna teks yang kontras dengan warna sekunder
    },

    accent: {
      default: '#B3B3B3', // Warna abu
    },

    dark: {
      main: '#000', // Warna hitam
      medium: '#1E1E1E', // Warna abu-abu gelap
      contrastText: '#fff', // Warna teks yang kontras dengan warna gelap
    },

    danger: {
      main: '#FF0000', // Warna merah untuk status bahaya
      contrastText: '#fff', // Warna teks yang kontras dengan warna bahaya
    },

    success: {
      main: '#4CAF50', // Warna hijau untuk status sukses
      contrastText: '#fff', // Warna teks yang kontras dengan warna sukses
    },

    info: {
      main: '#2196F3', // Warna biru untuk informasi
      contrastText: '#fff', // Warna teks yang kontras dengan warna informasi
    },
     },
  // Anda bisa menambahkan properti theming lain di sini (typography, spacing, breakpoints, components)
});

export default theme;