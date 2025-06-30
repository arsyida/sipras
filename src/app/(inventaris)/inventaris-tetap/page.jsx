"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Komponen
import PageLayout from '@/components/layouts/PageLayout';
import FilterBarComponent from '@/components/common/FilterBarComponent';
import TableComponent from '@/components/common/TableComponent';

// MUI Components
import { 
    Box, 
    CircularProgress, 
    Alert, 
    Button ,
    Divider
} from '@mui/material';

// Service untuk mengambil data
import { getPaginatedAssets } from '@/lib/services/assetServices'; // Kita akan ambil semua data dengan satu kali panggilan
import { getAllProductsForDropdown } from '@/lib/services/productServices';
import { getAllLocationsForDropdown } from '@/lib/services/locationServices';

/**
 * Halaman untuk menampilkan laporan agregat Inventaris Tetap.
 * Data dikelompokkan berdasarkan Produk dan Lokasi.
 */
export default function InventarisAgregatPage() {
    const router = useRouter();
    
    // --- STATE MANAGEMENT ---
    const [allAssets, setAllAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        product: '',
        location: '',
        condition: '',
    });
    const [filterOptions, setFilterOptions] = useState({
        product: [],
        location: [],
        condition: [
            { value: 'baik', label: 'Baik' },
            { value: 'rusak ringan', label: 'Rusak Ringan' },
            { value: 'rusak berat', label: 'Rusak Berat' },
            { value: 'perbaikan', label: 'Dalam Perbaikan' },
        ],
    });

    // --- PENGAMBILAN DATA ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Ambil semua aset sekaligus untuk agregasi di frontend
                // Kita set limit yang sangat tinggi untuk mendapatkan semua data
                const assetsRes = await getPaginatedAssets({ page: 1, limit: 10000 }); 
                setAllAssets(assetsRes.data || []);
                
                // Ambil data untuk dropdown filter
                const [productRes, locationRes] = await Promise.all([
                    getAllProductsForDropdown(),
                    getAllLocationsForDropdown(),
                ]);

                setFilterOptions(prev => ({
                    ...prev,
                    product: productRes.data.map(p => ({ value: p._id, label: `${p.name} (${p.product_code})` })),
                    location: locationRes.data.map(l => ({ value: l._id, label: `${l.name} (G:${l.building}/L:${l.floor})` }))
                }));

            } catch (err) {
                console.error("Gagal memuat data:", err);
                setError("Gagal memuat data untuk laporan. Silakan coba lagi.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);
    
    // --- DATA PROCESSING (AGREGASI & FILTERING) ---
    const processedData = useMemo(() => {
        // 1. Filter data terlebih dahulu
        const filteredAssets = allAssets.filter(asset => {
            const productMatch = filters.product ? asset.product?._id === filters.product : true;
            const locationMatch = filters.location ? asset.location?._id === filters.location : true;
            const conditionMatch = filters.condition ? asset.condition === filters.condition : true;
            return productMatch && locationMatch && conditionMatch;
        });

        // 2. Agregasi data yang sudah difilter
        const aggregationMap = {};
        filteredAssets.forEach(asset => {
            if (!asset.product || !asset.location) return;
            
            // Kunci unik untuk agregasi adalah kombinasi produk dan lokasi
            const key = `${asset.product._id}-${asset.location._id}`;

            if (aggregationMap[key]) {
                aggregationMap[key].jumlah += 1; // Tambah jumlahnya
            } else {
                aggregationMap[key] = {
                    id: key,
                    lokasi: `${asset.location.name} (G:${asset.location.building}/L:${asset.location.floor})`,
                    namaBarang: asset.product.name,
                    merk: asset.product.brand?.name || '-',
                    tahun: asset.purchase_date ? new Date(asset.purchase_date).getFullYear() : '-',
                    harga: asset.estimated_price || 0,
                    jumlah: 1, // Mulai hitungan
                    satuan: asset.product.measurement_unit || 'Unit',
                    kondisi: asset.condition,
                };
            }
        });
        
        return Object.values(aggregationMap);
    }, [allAssets, filters]);


    // --- EVENT HANDLERS ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateReport = () => console.log("Membuat laporan agregat...");

    // --- COLUMN & FILTER DEFINITIONS ---
    const columns = useMemo(() => [
        { id: "no", label: "No", align: 'center', renderCell: (row, index) => index + 1 },
        { id: 'lokasi', label: 'Lokasi' },
        { id: 'namaBarang', label: 'Nama Barang' },
        { id: 'merk', label: 'Merk' },
        { id: 'tahun', label: 'Tahun', align: 'center' },
        { id: 'harga', label: 'Harga Estimasi', align: 'right', renderCell: (row) => `Rp ${row.harga.toLocaleString('id-ID')}` },
        { id: 'jumlah', label: 'Jumlah', align: 'center', renderCell: (row) => `${row.jumlah} ${row.satuan}` },
        { id: 'kondisi', label: 'Kondisi' },
    ], []);
    
    const filterConfig = useMemo(() => [
        { name: "product", label: "Produk", type: "select", options: filterOptions.product },
        { name: "location", label: "Lokasi", type: "select", options: filterOptions.location },
        { name: "condition", label: "Kondisi", type: "select", options: filterOptions.condition },
    ], [filterOptions]);

    const actionButtons = (
        <Button variant="outlined" onClick={handleGenerateReport}>
            Cetak Laporan
        </Button>
    );

    return (
        <PageLayout title="Laporan Agregat Aset Tetap" actionButtons={actionButtons}>
            <FilterBarComponent 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                filterConfig={filterConfig}
            />
            <Divider sx={{ my: 2 }} />
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
            ) : (
                <TableComponent
                    columns={columns}
                    data={processedData}
                    // Tidak ada aksi per baris di halaman agregat
                />
            )}
        </PageLayout>
    );
}
