"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';

// Komponen generik
import InventoryPageLayout from '@/components/common/InventoryPageLayout';
import FilterBarComponent from '@/components/common/FilterBarComponent';
import TableComponent from '@/components/common/TableComponent'; 

// MUI Components
import { Tooltip, IconButton, Box, CircularProgress, Alert, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Asumsi ada service untuk mengambil data merk
import { getAllBrands } from '@/lib/services/brandServices';

/**
 * Halaman untuk menampilkan dan mengelola daftar Merk Produk.
 */
export default function BrandPage() {
    const router = useRouter();
    
    // State untuk data, loading, error, dan filter
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ name: '' });

    // Mengambil data saat komponen pertama kali dimuat
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getAllBrands();
                // Asumsi service mengembalikan { success: true, data: [...] }
                setBrands(response.data || []);
            } catch (err) {
                console.error("Gagal memuat data merk:", err);
                setError("Gagal memuat data merk. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handler untuk perubahan filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Handler untuk aksi tombol
    const handleAddItem = () => router.push('/inventaris/merk/tambah');
    const handleEdit = (item) => router.push(`/inventaris/merk/edit/${item._id}`);
    const handleDelete = (item) => {
        // Implementasi logika hapus, misalnya dengan membuka modal konfirmasi
        console.log("Menghapus merk:", item._id);
    };

    // Logika untuk memfilter data berdasarkan input pengguna
    const filteredData = useMemo(() => {
        if (!brands) return [];
        return brands.filter(item => 
            item.name.toLowerCase().includes(filters.name.toLowerCase())
        );
    }, [brands, filters]);

    // Definisi kolom untuk tabel, disesuaikan dengan BrandSchema
    const columns = [
        { id: 'name', label: 'Nama Merk' },
        { 
          id: 'description', 
          label: 'Deskripsi',
          // Menampilkan strip jika deskripsi kosong
          renderCell: (row) => row.description || '-'
        },
    ];

    // Tampilan saat loading atau terjadi error
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    // Tampilan utama halaman
    return (
        <InventoryPageLayout title="Manajemen Merk" onAdd={handleAddItem}>
            <FilterBarComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                searchLabel="Cari Nama Merk"
                searchKey="name"
                hideDropdowns={true} // Hanya ada filter pencarian untuk halaman ini
            />
            <TableComponent
                columns={columns}
                data={filteredData}
                renderActionCell={(row) => (
                    <Box>
                        <Tooltip title="Edit">
                            <IconButton onClick={() => handleEdit(row)}><EditIcon color="action" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                            <IconButton onClick={() => handleDelete(row)}><DeleteIcon color="error" /></IconButton>
                        </Tooltip>
                    </Box>
                )}
            />
        </InventoryPageLayout>
    );
}
