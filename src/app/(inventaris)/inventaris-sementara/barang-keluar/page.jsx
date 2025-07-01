import { Suspense } from 'react';
import PageLayout from '@/components/layouts/PageLayout';
import BarangKeluarPage from './BarangKeluarPage'; // Komponen klien Anda
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// TIDAK ADA 'use client' di sini
export default function BarangKeluarPage() {
  return (
    <PageLayout title="Daftar Barang Keluar">
      <Suspense fallback={<LoadingSpinner />}>
        <BarangKeluarPage />
      </Suspense>
    </PageLayout>
  );
}