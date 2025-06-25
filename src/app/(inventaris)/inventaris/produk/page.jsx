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

// Asumsi ada service untuk data
import { getAllProducts } from '@/lib/services/productServices';
import { getAllBrands } from '@/lib/services/brandServices';
import { getAllCategories } from '@/lib/services/categoryServices';

/**
 * Halaman untuk menampilkan dan mengelola daftar Produk (Master).
 */
export default function ProductPage() {
    const router = useRouter();
    
    const [products, setProducts] = useState([]);
    const [options, setOptions] = useState({ brand: [], category: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ name: '', brand: '', category: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Ambil semua data secara paralel
                const [productRes, brandRes, categoryRes] = await Promise.all([
                    getAllProducts(),
                    getAllBrands(),
                    getAllCategories()
                ]);

                // Asumsi service mengembalikan { success: true, data: [...] }
                setProducts(productRes.data || []);
                setOptions({
                    brand: brandRes.data.map(b => b.name) || [],
                    category: categoryRes.data.map(c => c.name) || [],
                });

            } catch (err) {
                console.error("Gagal memuat data produk:", err);
                setError("Gagal memuat data produk.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleAddItem = () => router.push('/inventaris/produk/tambah');
    const handleEdit = (item) => router.push(`/inventaris/produk/edit/${item._id}`);
    const handleDelete = (item) => console.log("Menghapus produk:", item._id);

    const filteredData = useMemo(() => {
        if (!products) return [];
        return products.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(filters.name.toLowerCase());
            // Filter berdasarkan nama dari objek brand dan kategori
            const brandMatch = filters.brand ? item.brand?.name === filters.brand : true;
            const categoryMatch = filters.category ? item.category?.name === filters.category : true;
            return nameMatch && brandMatch && categoryMatch;
        });
    }, [products, filters]);

    // Definisi kolom disesuaikan dengan skema
    const columns = [
        { id: 'product_code', label: 'Kode Produk' },
        { id: 'name', label: 'Nama Produk' },
        { 
          id: 'category', 
          label: 'Kategori',
          // Render nama dari objek kategori yang di-populate
          renderCell: (row) => row.category?.name || 'N/A'
        },
        { 
          id: 'brand', 
          label: 'Merk',
          // Render nama dari objek brand yang di-populate
          renderCell: (row) => row.brand?.name || 'N/A'
        },
        { id: 'measurement_unit', label: 'Satuan' },
        { id: 'totalStock', label: 'Total Stok' }, // Asumsi 'totalStock' dihitung oleh backend
    ];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    return (
        <InventoryPageLayout title="Manajemen Produk" onAdd={handleAddItem}>
            <FilterBarComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                searchLabel="Cari Nama Produk"
                searchKey="name"
                options={options} // Menggunakan opsi dinamis untuk brand dan kategori
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
