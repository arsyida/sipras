"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Komponen generik
import PageLayout from '@/components/layouts/PageLayout';
import FilterBarComponent from '@/components/common/FilterBarComponent';
import TableComponent from '@/components/common/TableComponent';
import PaginationComponent from '@/components/common/PaginationComponent';

// MUI Components
import { 
    Box, 
    CircularProgress, 
    Alert, 
    Button,
    Divider,
    Chip,
    Typography
} from '@mui/material';

// Service untuk mengambil data
import { getPaginatedConsumableLogs } from '@/lib/services/consumableServices';

/**
 * Halaman untuk menampilkan riwayat transaksi barang habis pakai.
 */
export default function ConsumableLogPage() {
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk filter tanggal
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        rowsPerPage: 10,
        totalItems: 0,
    });

    // --- PENGAMBILAN DATA ---
    const fetchData = useCallback(async (page, limit, currentFilters) => {
        // Jangan fetch jika salah satu tanggal diisi tapi yang lain tidak
        if ((currentFilters.startDate && !currentFilters.endDate) || (!currentFilters.startDate && currentFilters.endDate)) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Format filter tanggal sebelum dikirim ke API
            const apiFilters = {
                startDate: currentFilters.startDate ? new Date(currentFilters.startDate).toISOString() : '',
                endDate: currentFilters.endDate ? new Date(currentFilters.endDate).toISOString() : '',
            };

            const response = await getPaginatedConsumableLogs({
                page,
                limit,
                filters: apiFilters,
            });
            setLogs(response.data || []);
            setPagination((prev) => ({ ...prev, ...response.pagination, rowsPerPage: limit, currentPage: page }));
        } catch (err) {
            console.error("Gagal memuat data log:", err);
            setError("Gagal memuat riwayat transaksi. Silakan coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data setiap kali ada perubahan pada pagination atau filter
    useEffect(() => {
        fetchData(pagination.currentPage, pagination.rowsPerPage, filters);
    }, [pagination.currentPage, pagination.rowsPerPage, filters, fetchData]);

    // --- EVENT HANDLERS ---
    const handleFilterChange = (key, value) => {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (event, value) => {
        setPagination((prev) => ({ ...prev, currentPage: value }));
    };

    const handleRowsPerPageChange = (event) => {
        setPagination((prev) => ({
            ...prev,
            rowsPerPage: parseInt(event.target.value, 10),
            currentPage: 1,
        }));
    };

    // --- COLUMN & FILTER DEFINITIONS ---
    const columns = useMemo(() => [
        { 
            id: "date", 
            label: "Tanggal", 
            renderCell: (row) => new Date(row.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
        },
        { 
            id: 'product', 
            label: 'Nama Barang', 
            renderCell: (row) => row.stock_item?.product?.name || 'N/A' 
        },
        { 
            id: 'type', 
            label: 'Jenis Transaksi',
            align: 'center',
            renderCell: (row) => (
                <Chip 
                    label={row.transaction_type === 'penambahan' ? 'Stok Masuk' : 'Stok Keluar'}
                    color={row.transaction_type === 'penambahan' ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        { id: 'quantity', label: 'Jumlah', align: 'center', renderCell: (row) => `${row.quantity_changed} ${row.stock_item?.unit || ''}` },
        { id: 'person_name', label: 'Nama Pengambil/Penambah', renderCell: (row) => row.person_name || '-' },
        { id: 'user', label: 'Dicatat oleh', renderCell: (row) => row.user?.name || 'Sistem' },
        { id: 'notes', label: 'Catatan/Keperluan', renderCell: (row) => row.notes || '-' },
    ], []);

    const filterConfig = [
        { name: "startDate", label: "Dari Tanggal", type: "date" },
        { name: "endDate", label: "Sampai Tanggal", type: "date" },
    ];

    return (
        <PageLayout title="Riwayat Transaksi Barang Habis Pakai">
            <FilterBarComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                filterConfig={filterConfig}
            />
            <Divider sx={{ my: 2 }} />
            
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
            ) : error ? (
                <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
            ) : (
                <>
                    <PaginationComponent
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        rowsPerPage={pagination.rowsPerPage}
                        totalItems={pagination.totalItems}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                    />
                    <TableComponent
                        columns={columns}
                        data={logs}
                        // Tidak ada aksi per baris di halaman log
                    />
                </>
            )}
        </PageLayout>
    );
}
