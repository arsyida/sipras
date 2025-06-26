"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';

// Komponen generik
import InventoryPageLayout from '@/components/common/InventoryPageLayout';
import FilterBarComponent from '@/components/common/FilterBarComponent';
import TableComponent from '@/components/common/TableComponent';

// MUI Components
import { Tooltip, IconButton, Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


// Service untuk mengambil data
import { getAllLocations } from '@/lib/services/locationServices';


/**
 * Halaman utama untuk menampilkan dan mengelola daftar lokasi inventaris.
 */
export default function InventarisLokasiPage() {
    const theme = useTheme();
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        gedung: '',
        lantai: '',
        name: '', // Filter berdasarkan nama ruang
    });

    // --- PENGAMBILAN DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getAllLocations();

                // Asumsi API mengembalikan objek { success: true, data: [...] }
                setLocations(response.data || []);

            } catch (err) {
                console.error("Gagal memuat data lokasi:", err);
                setError("Gagal memuat data lokasi. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- EVENT HANDLERS ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleAddItem = () => router.push('/inventaris/lokasi/tambah');
    const handleGenerateReport = () => console.log("Membuat laporan lokasi...");
    const handleEdit = (item) => router.push(`/inventaris/lokasi/edit/${item._id}`);
    const handleDelete = (item) => console.log("Menghapus lokasi:", item._id);

    // --- DATA PROCESSING (FILTERING) ---
    const filteredData = useMemo(() => {
        if (!locations) return [];

        return locations.filter(item => {
            const buildingMatch = filters.gedung ? item.building === filters.gedung : true;
            const floorMatch = filters.lantai ? item.floor === filters.lantai : true;
            const nameMatch = filters.name ? item.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
            return buildingMatch && floorMatch && nameMatch;
        });
    }, [locations, filters]);

    // --- COLUMN & FILTER DEFINITIONS ---
    const columns = [
        { id: 'no', label: 'No', align: 'center', renderCell: (row, index) => index + 1 },
        { id: 'building', label: 'Gedung' },
        { id: 'floor', label: 'Lantai' },
        { id: 'name', label: 'Nama Ruang' },
    ];

    const filterOptions = useMemo(() => {
        if (!locations) return { gedung: [], lantai: [] };
        return {
            gedung: [...new Set(locations.map(item => item.gedung))],
            lantai: [...new Set(locations.map(item => item.lantai))],
        }
    }, [locations]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    return (
        <InventoryPageLayout
            title="Manajemen Lokasi"
            onAdd={handleAddItem}
            onGenerateReport={handleGenerateReport}
        >
            <FilterBarComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                options={filterOptions}
                searchLabel="Cari Nama Ruang"
                searchKey="name"
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
