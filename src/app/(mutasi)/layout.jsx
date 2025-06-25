"use client";

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MyBreadcrumbs from '@/components/common/BreadcrumbsComponent';
import HeaderSection from '@/components/common/HeaderSection';
import FilterSection from '@/components/common/FilterSection';

// Layout ini akan membungkus SEMUA halaman di bawah /mutasi/*
// (Contoh: /mutasi/barang-keluar, /mutasi/barang-keluar/detail)
export default function MutasiRootLayout({ children }) {
  const theme = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Mengekstrak 'tipe' dari URL secara dinamis
  // Contoh: /mutasi/barang-keluar/detail -> segments = ['', 'mutasi', 'barang-keluar', 'detail']
  const pathSegments = pathname.split('/');
  const type = pathSegments[1] || ''; // Hasilnya 'barang-keluar'

  // 2. Menentukan logika kondisional berdasarkan 'type' dan 'pathname'
  const isTipeBarangKeluar = type === 'barang-keluar';

  // Halaman dianggap "list page" (yang butuh filter) jika:
  // - Tipenya 'barang-keluar' DAN path-nya mengandung '/detail'
  // - ATAU jika tipenya 'tidak-tetap' (karena halaman utamanya adalah list)
  // 3. Inisialisasi state filter dari URL (search params)
  // Berjalan saat komponen pertama kali render atau saat navigasi.
  const [searchQuery, setSearchQuery] = React.useState('');
  const [modelFilter, setModelFilter] = React.useState(() => searchParams.get('model') || '');
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get('status') || '');
  const [generalFilter, setGeneralFilter] = React.useState(() => searchParams.get('general') || '');
  const [dateFilter, setDateFilter] = React.useState(null);

  // 4. Mengatur judul halaman secara dinamis
  const inventoryTypeSlug = type.replace(/-/g, ' ');
  const capitalizedType = inventoryTypeSlug.charAt(0).toUpperCase() + inventoryTypeSlug.slice(1);
  let pageTitle = '';

  if (isTipeBarangKeluar) {
    // Gunakan '/detail' sebagai penanda halaman daftar
    pageTitle = pathname.includes('/detail')
      ? `Detail ${capitalizedType}`
      : `${capitalizedType}`;
  } else if (type) { // Hanya set judul jika 'type' ada
    pageTitle = `${capitalizedType}`;
  }

  const addLinkHref = `/inventaris/${type}/tambah`;

  // Objek filter states untuk diteruskan ke FilterSection dan page.jsx
  const filterStates = {
    searchQuery, modelFilter, statusFilter, generalFilter, dateFilter
  };

  // Objek filter handlers untuk diteruskan ke FilterSection
  const filterHandlers = {
    onSearchChange: (e) => setSearchQuery(e.target.value),
    onModelChange: (e) => setModelFilter(e.target.value),
    onStatusChange: (e) => setStatusFilter(e.target.value),
    onGeneralFilterChange: (e) => setGeneralFilter(e.target.value),
    onDateChange: (newValue) => setDateFilter(newValue),
  };

  // Konfigurasi dropdown filters (bisa Anda sesuaikan)
  const inventarisDropdownFilters = [
    { id: 'date', label: 'Tanggal', type: 'date', stateKey: 'dateFilter', handlerKey: 'onDateChange' },
    { id: 'general', label: 'Filter', type: 'select', stateKey: 'generalFilter', handlerKey: 'onGeneralFilterChange', options: [{ value: 'Filter1', label: 'Filter 1' }, { value: 'Filter2', label: 'Filter 2' }] },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 7, sm: 8 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <MyBreadcrumbs />

      {/* Tampilkan Header & Filter hanya jika 'type' terdeteksi di URL */}
      
        <>
          <HeaderSection title={pageTitle} addLinkHref={addLinkHref} />
          <Divider flexItem sx={{ bgcolor: theme.palette.secondary.main }} />

          {/* 5. Tampilkan FilterSection HANYA jika ini adalah halaman daftar */}
            <>
              <FilterSection
                searchLabel="Cari ID/Nama Barang"
                searchQuery={searchQuery}
                onSearchChange={filterHandlers.onSearchChange}
                filterStates={filterStates}
                filterHandlers={filterHandlers}
                dropdownFilters={inventarisDropdownFilters}
              />
              <Divider flexItem sx={{ bgcolor: theme.palette.secondary.main }} />
            </>
        </>

      {/* 6. Meneruskan props ke "children" (page.jsx yang sesuai) */}
      {/* React.cloneElement memastikan page di bawahnya menerima props ini */}
      {React.cloneElement(children, {
        inventoryType: type,
        filters: filterStates,
      })}
    </Box>
  );
}