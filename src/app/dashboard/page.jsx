"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// components
import SummaryCard from "@/components/dashboard/SummaryCard";
import LowStockList from "@/components/dashboard/LowStockList";
import PageLayout from "@/components/layouts/PageLayout"; // Menggunakan PageLayout

// material-ui
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";

// Services
import { getPaginatedAssets } from "@/lib/services/assetServices";
import { getPaginatedConsumableStock, getPaginatedConsumableLogs } from "@/lib/services/consumableServices";

// Komponen Tabel Transaksi yang lebih generik
const TransactionTable = ({ title, headers, data, renderRow }) => (
  <Box>
    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 500 }}>
      {title}
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ "& .MuiTableCell-head": { fontWeight: "bold" } }}>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{data.map(renderRow)}</TableBody>
      </Table>
    </TableContainer>
  </Box>
);

// --- KOMPONEN UTAMA HALAMAN DASHBOARD ---
export default function DashboardPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalConsumableStock: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  // --- PENGAMBILAN DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil semua data yang diperlukan secara paralel
        const [assetsRes, lowStockRes, logsRes] = await Promise.all([
          getPaginatedAssets({ page: 1, limit: 1 }), // Cukup ambil totalnya
          getPaginatedConsumableStock({ page: 1, limit: 10, filters: { low_stock: true } }),
          getPaginatedConsumableLogs({ page: 1, limit: 5 }) // Ambil 5 transaksi terakhir
        ]);

        // Hitung total stok barang habis pakai
        const allStockRes = await getPaginatedConsumableStock({ page: 1, limit: 10000 });
        const totalConsumable = allStockRes.data.reduce((acc, item) => acc + item.quantity, 0);

        // Set state dengan data dari API
        setSummary({
            totalAssets: assetsRes.pagination.totalItems || 0,
            totalConsumableStock: totalConsumable || 0,
        });
        setLowStockItems(lowStockRes.data || []);
        setRecentLogs(logsRes.data || []);

      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
        setError("Gagal memuat data dashboard. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
        <PageLayout title="Dashboard">
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        </PageLayout>
    );
  }
  if (error) {
    return (
        <PageLayout title="Dashboard">
            <Alert severity="error">{error}</Alert>
        </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard Overview">
      <Box display="flex" flexDirection="row" width={"100%"} gap={4}>
        <SummaryCard
          title="Total Inventaris Tetap"
          value={summary.totalAssets}
          unit="Aset"
          onClick={() => router.push('/inventaris/aset')}
        />
        <SummaryCard
          title="Total Stok Habis Pakai"
          value={summary.totalConsumableStock}
          unit="Item"
          onClick={() => router.push('/inventaris-habis-pakai/stok')}
        />
      </Box>

      <LowStockList items={lowStockItems} />

      <TransactionTable
        title="Aktivitas Terbaru Barang Habis Pakai"
        headers={[
          "Tanggal",
          "Nama Barang",
          "Jenis",
          "Jumlah",
          "Dicatat Oleh",
          "Pengambil/Penambah",
        ]}
        data={recentLogs}
        renderRow={(row, index) => (
          <TableRow key={row._id || index}>
            <TableCell>{new Date(row.createdAt).toLocaleString('id-ID')}</TableCell>
            <TableCell>{row.stock_item?.product?.name || 'N/A'}</TableCell>
            <TableCell>
                <Chip 
                    label={row.transaction_type === 'penambahan' ? 'Masuk' : 'Keluar'}
                    color={row.transaction_type === 'penambahan' ? 'success' : 'warning'}
                    size="small"
                />
            </TableCell>
            <TableCell>{`${row.quantity_changed} ${row.stock_item?.unit || ''}`}</TableCell>
            <TableCell>{row.user?.name}</TableCell>
            <TableCell>{row.person_name}</TableCell>
          </TableRow>
        )}
      />
    </PageLayout>
  );
}
