// src/app/_components/MyBreadcrumbs.jsx
"use client"; // Ini adalah Client Component

import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname

// Fungsi pembantu untuk memformat segmen path menjadi label yang lebih baik
// Contoh: 'inventaris-tetap' menjadi 'Inventaris Tetap'
function formatPathSegment(segment) {
  if (!segment) return '';
  return segment
    .split('-') // Pisahkan berdasarkan '-'
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi setiap kata
    .join(' '); // Gabungkan kembali
}

export default function MyBreadcrumbs() {
  const pathname = usePathname(); // Dapatkan path URL saat ini
  const pathSegments = pathname.split('/').filter(segment => segment); // Pisahkan dan filter segmen kosong

  // Bangun item breadcrumbs secara dinamis
  const breadcrumbItems = React.useMemo(() => {
    let currentPath = '';
    const items = [
      { label: 'Dashboard', href: '/dashboard' }, // Item Dashboard sebagai akar
    ];

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = formatPathSegment(segment);
      items.push({
        label: label,
        href: currentPath,
      });
    });

    return items;
  }, [pathname]); // Rekalkulasi jika pathname berubah

  return (
    <div role="presentation">
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        maxItems={4} // Tampilkan maksimal 4 item, sisanya ellipsis jika terlalu panjang
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return isLast ? (
            <Typography key={item.href} color="text.primary" sx={{ fontWeight: 'bold' }}>
              {item.label}
            </Typography>
          ) : (
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