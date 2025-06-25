// src/app/_components/MyBreadcrumbs.jsx
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// MUI Components
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Memformat segmen path menjadi label yang mudah dibaca.
 * Mengganti tanda hubung dengan spasi dan mengapitalisasi setiap kata.
 * @param {string} segment - Segmen path URL (contoh: 'inventaris-tetap').
 * @returns {string} Label yang diformat (contoh: 'Inventaris Tetap').
 */
function formatPathSegment(segment) {
  if (!segment) return '';
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Komponen Breadcrumbs yang secara dinamis membangun navigasi berdasarkan path URL saat ini.
 * Secara otomatis menambahkan 'Dashboard' sebagai item root.
 */
export default function BreadcrumbsComponent() {
  const pathname = usePathname();

  // Gunakan React.useMemo untuk menghitung item breadcrumb hanya saat pathname berubah.
  // Ini meningkatkan performa dengan menghindari kalkulasi ulang yang tidak perlu pada setiap render.
  const breadcrumbItems = React.useMemo(() => {
    // Definisikan item root/utama secara eksplisit.
    const rootItem = { label: 'Dashboard', href: '/dashboard' };

    // Abaikan path root ('/') untuk menghindari breadcrumb kosong.
    if (pathname === '/' || pathname === '/dashboard') {
        return [rootItem];
    }
    
    const pathSegments = pathname.split('/').filter(segment => segment);
    let currentPath = '';

    // Transformasi setiap segmen path menjadi objek breadcrumb.
    const dynamicItems = pathSegments.map(segment => {
      currentPath += `/${segment}`;
      return {
        label: formatPathSegment(segment),
        href: currentPath,
      };
    });

    // Jika path tidak dimulai dari dashboard, tetap tampilkan Dashboard sebagai root.
    // Ini adalah asumsi desain: semua halaman berada di bawah Dashboard.
    if(pathSegments[0] !== 'dashboard') {
        return [rootItem, ...dynamicItems];
    }

    return dynamicItems;

  }, [pathname]);

  return (
    <div role="presentation">
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        maxItems={4} // Tampilkan maksimal 4 item untuk menghindari layout yang terlalu ramai.
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          // Item terakhir dalam breadcrumbs dirender sebagai teks tebal (tidak bisa diklik).
          if (isLast) {
            return (
              <Typography key={item.href} color="text.primary" sx={{ fontWeight: 'bold' }}>
                {item.label}
              </Typography>
            );
          }

          // Item lainnya dirender sebagai link yang bisa diklik.
          return (
            <MuiLink
              key={item.href}
              component={Link}
              href={item.href}
              underline="hover"
              color="inherit"
            >
              {item.label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}
