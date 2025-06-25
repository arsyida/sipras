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

// Asumsi ada service untuk mengambil data kategori
import { getAllCategories } from '@/lib/services/categoryServices';

/**
 * Halaman untuk menampilkan dan mengelola daftar Kategori Produk.
 */
export default function CategoryPage() {
    const router = useRouter();
    
    // State untuk data, loading, error, dan filter
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ name: '' });

    // Mengambil data saat komponen pertama kali dimuat
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getAllCategories();
                // Asumsi service mengembalikan { success: true, data: [...] }
                setCategories(response.data || []);
            } catch (err) {
                console.error("Gagal memuat data kategori:", err);
                setError("Gagal memuat data kategori. Silakan coba lagi nanti.");
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
    const handleAddItem = () => router.push('/inventaris/kategori/tambah');
    const handleEdit = (item) => router.push(`/inventaris/kategori/edit/${item._id}`);
    const handleDelete = (item) => {
        // Implementasi logika hapus, misalnya dengan membuka modal konfirmasi
        console.log("Menghapus kategori:", item._id);
    };

    // Logika untuk memfilter data berdasarkan input pengguna
    const filteredData = useMemo(() => {
        if (!categories) return [];
        return categories.filter(item => 
            item.name.toLowerCase().includes(filters.name.toLowerCase())
        );
    }, [categories, filters]);

    // Definisi kolom untuk tabel, disesuaikan dengan CategorySchema
    const columns = [
        { id: 'name', label: 'Nama Kategori' },
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
        <InventoryPageLayout title="Manajemen Kategori" onAdd={handleAddItem}>
            <FilterBarComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                searchLabel="Cari Nama Kategori"
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
