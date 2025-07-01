// src/theme.js
"use client";
import { Inter } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

// Konfigurasi Font Google
const inter = Inter({ 
  weight: ['300', '400', '500', '600', '700'], 
  subsets: ['latin'], 
  display: 'swap'
});

// Membuat tema dasar
let theme = createTheme({
  // 1. PALET WARNA
  // Palet warna inti untuk branding dan status UI.
  palette: {
    primary: {
      main: '#7E136D', // Ungu gelap utama
      light: '#A94E9D', // Versi lebih terang dari ungu
      dark: '#540C4A',  // Versi lebih gelap dari ungu
      contrastText: '#fff', 
    },
    secondary: {
      main: '#FECE1F', // Kuning utama
      light: '#FFDA52',
      dark: '#E5B91C',
      contrastText: '#1E1E1E', // Kontras lebih baik dengan abu-abu gelap daripada hitam murni
    },
    error: {
      main: '#FF1744', // Merah yang lebih modern untuk error
    },
    success: {
      main: '#00C853', // Hijau yang lebih cerah untuk sukses
    },
    info: {
      main: '#2979FF', // Biru yang jelas untuk informasi
    },
    warning: {
        main: '#FF9100', // Oranye untuk peringatan
    },
    text: {
        primary: '#1E1E1E', // Abu-abu sangat gelap untuk teks utama
        secondary: '#616161', // Abu-abu lebih terang untuk teks sekunder
    },
    background: {
        default: '#F5F5F7', // Abu-abu sangat terang untuk latar belakang halaman
        paper: '#FFFFFF',   // Putih bersih untuk Card, Paper, dll.
    },
    // Menambahkan warna kustom Anda
    accent: {
      default: '#B3B3B3',
    },
    dark: {
      main: '#000', 
      medium: '#1E1E1E',
      contrastText: '#fff',
    },
  },

  // 2. TIPOGRAFI
  // Mendefinisikan skala tipografi yang konsisten.
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1.1rem', fontWeight: 500 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 }, // Teks paragraf utama
    body2: { fontSize: '0.875rem', fontWeight: 400 }, // Teks yang lebih kecil
    button: { textTransform: 'none', fontWeight: 600 }, // Tombol tidak menggunakan ALL CAPS
  },

  // 3. BENTUK & SUDUT
  // Mendefinisikan radius sudut (border-radius) default.
  shape: {
    borderRadius: 4, // Sudut yang lebih rounded dan modern
  },
  
  components:{
    MuiDrawer: {
      styleOverrides: {
        paper: {
            backgroundColor: '#7E136D', // Latar belakang ungu (primary.main)
            color: '#FFFFFF', // Teks putih (primary.contrastText)
            '& .MuiListItemIcon-root': { // Mengubah warna ikon menjadi putih juga
              color: '#FFFFFF',
            },
            '& .MuiDivider-root': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
            }
        }
      }
    },
  }
});

export default theme;
