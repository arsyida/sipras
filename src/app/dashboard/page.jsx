// src/app/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from "react";

// components
import SummaryCard from "@/components/dashboard/SummaryCard";
import LowStockList from "@/components/dashboard/LowStockList";

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
} from "@mui/material";

import { getPaginatedAssets } from "@/lib/services/assetServices";

// --- DATA DUMMY ---
// Di dunia nyata, ini akan datang dari API call
const mockData = {
  summary: {
    barangTetap: 700,
    stokSementara: 7567,
  },
  lowStock: [
    { name: "Tinta", quantity: 140 },
    { name: "Spion", quantity: 120 },
    { name: "Taplak", quantity: 160 },
    { name: "Mouse", quantity: 130 },
    { name: "Kapur", quantity: 170 },
  ],
  barangMasuk: [
    {
      no: 1,
      tanggal: "30/06/2022",
      nama: "Sarpras",
      jabatan: "TU",
      barangMasuk: "Meja",
      jumlah: 70,
      keterangan: "-",
    },
    {
      no: 2,
      tanggal: "30/05/2022",
      nama: "Sarpras",
      jabatan: "TU",
      barangMasuk: "Meja",
      jumlah: 70,
      keterangan: "-",
    },
  ],
  barangKeluar: [
    {
      no: 1,
      tanggal: "30/06/2022",
      nama: "Ayu",
      jabatan: "TU",
      barangKeluar: "Meja",
      jumlah: 5,
      keterangan: "-",
      keperluan: "Bendahara",
    },
  ],
};

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
  // Di aplikasi nyata, Anda akan menggunakan state untuk data dari API
  const [data, setData] = useState(mockData);
  const [totalAssets, setTotalAssets] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
          try {
    
            const assetsRes = await getPaginatedAssets({ page: 1, limit: 10000 });
            setTotalAssets(assetsRes.totalItems || 0);
    
          } catch (err) {
            console.error("Gagal memuat data:", err);
            setError("Gagal memuat data untuk laporan. Silakan coba lagi.");
          }
        };
        fetchAllData();
  }, []);

  if (!data) {
    return <Typography>Loading...</Typography>; // Atau tampilkan skeleton loader
  }

  return (
    <Box display="flex" flexDirection="column" gap={4} p={2}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Overview
        </Typography>
        <Box display="flex" flexDirection="row" width={"100%"} gap={4}>
          <SummaryCard
            title="Total Inventaris Tetap"
            value={totalAssets}
            unit="Barang"
          />
          <SummaryCard
            title="Total Stok Inventaris Sementara"
            value={data.summary.stokSementara}
            unit="Barang"
          />
        </Box>
      </Box>
      <LowStockList items={data.lowStock} />
      <TransactionTable
        title="Barang Masuk"
        headers={[
          "No",
          "Tanggal",
          "Nama",
          "Jabatan",
          "Barang Masuk",
          "Jumlah",
          "Keterangan",
        ]}
        data={data.barangMasuk}
        renderRow={(row) => (
          <TableRow
            key={row.no}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell>{row.no}</TableCell>
            <TableCell>{row.tanggal}</TableCell>
            <TableCell>{row.nama}</TableCell>
            <TableCell>{row.jabatan}</TableCell>
            <TableCell>{row.barangMasuk}</TableCell>
            <TableCell>{row.jumlah}</TableCell>
            <TableCell>{row.keterangan}</TableCell>
          </TableRow>
        )}
      />
      <TransactionTable
        title="Barang Keluar"
        headers={[
          "No",
          "Tanggal",
          "Nama",
          "Jabatan",
          "Barang Keluar",
          "Jumlah",
          "Keterangan",
          "Keperluan",
        ]}
        data={data.barangKeluar}
        renderRow={(row) => (
          <TableRow
            key={row.no}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell>{row.no}</TableCell>
            <TableCell>{row.tanggal}</TableCell>
            <TableCell>{row.nama}</TableCell>
            <TableCell>{row.jabatan}</TableCell>
            <TableCell>{row.barangKeluar}</TableCell>
            <TableCell>{row.jumlah}</TableCell>
            <TableCell>{row.keterangan}</TableCell>
            <TableCell>{row.keperluan}</TableCell>
          </TableRow>
        )}
      />
    </Box>
  );
}
