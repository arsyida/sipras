"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';

// Menggunakan nama komponen yang lebih generik
import FilterBarComponent from '@/components/common/FilterBarComponent';
import TableComponent from '@/components/common/TableComponent'; 

// MUI Components
import { Typography, Tooltip, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import PageLayout from '@/components/common/PageLayout';

// --- DATA DUMMY (Di aplikasi nyata, ini akan datang dari API) ---
const mockInventoryData = [
    { id: 'BRG001', date: '2023-01-15', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 5, status: 'Baik', gedung: 'A', lantai: '3', ruang: 'A301' },
    { id: 'BRG002', date: '2023-01-15', name: 'Kursi Siswa', merk: 'Ikea', year: 2022, quantity: 8, status: 'Baik', gedung: 'A', lantai: '3', ruang: 'A301' },
    { id: 'BRG003', date: '2023-02-10', name: 'Kursi Siswa', merk: 'Informa', year: 2021, quantity: 20, status: 'Rusak', gedung: 'B', lantai: '1', ruang: 'B102' },
    { id: 'BRG004', date: '2023-02-12', name: 'Papan Tulis', merk: 'Ikea', year: 2023, quantity: 1, status: 'Baik', gedung: 'A', lantai: '2', ruang: 'A205' },
];

/**
 * Halaman utama untuk menampilkan daftar agregat Inventaris Tetap berdasarkan lokasi.
 */
export default function InventarisTetapPage() {
    const theme = useTheme();
    const router = useRouter();
    
    // --- STATE MANAGEMENT ---
    const [inventoryData, setInventoryData] = React.useState(mockInventoryData);
    const [filters, setFilters] = React.useState({
        gedung: '',
        lantai: '',
        ruang: '',
    });

    // --- EVENT HANDLERS ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleAddItem = () => {
        console.log("Navigasi ke halaman tambah item...");
        // router.push('/inventaris/tetap/tambah');
    };

    const handleGenerateReport = () => {
        console.log("Membuat laporan...");
    };
    
    const handleNavigateToDetail = (item) => {
        const query = new URLSearchParams({
            gedung: item.gedung,
            lantai: item.lantai,
            ruang: item.ruang,
        }).toString();
        // Arahkan ke halaman detail per lokasi
        router.push(`/inventaris/tetap/detail?${query}`);
    };

    // --- DATA PROCESSING (AGREGASI LOKASI & FILTERING) ---
    const processedData = React.useMemo(() => {
        // 1. Agregasi Data Berdasarkan Lokasi
        const aggregationMap = {};
        inventoryData.forEach(item => {
            const key = `${item.gedung}-${item.lantai}-${item.ruang}`;
            if (aggregationMap[key]) {
                // Tambahkan jumlah dari setiap aset
                aggregationMap[key].totalQuantity += item.quantity;
            } else {
                // Buat entri baru untuk lokasi
                aggregationMap[key] = {
                    id: key, // ID unik untuk baris tabel
                    gedung: item.gedung,
                    lantai: item.lantai,
                    ruang: item.ruang,
                    totalQuantity: item.quantity,
                };
            }
        });
        const aggregated = Object.values(aggregationMap);
        
        // 2. Filtering Data Lokasi yang sudah diagregasi
        return aggregated.filter(item => {
            const gedungMatch = filters.gedung ? item.gedung === filters.gedung : true;
            const lantaiMatch = filters.lantai ? item.lantai === filters.lantai : true;
            const ruangMatch = filters.ruang ? item.ruang.toLowerCase().includes(filters.ruang.toLowerCase()) : true;
            return gedungMatch && lantaiMatch && ruangMatch;
        });
    }, [inventoryData, filters]);

    // --- COLUMN DEFINITION untuk tabel Agregat Lokasi ---
    const columns = [
        { id: "no", label: "No", renderCell: (row, index) => index + 1 },
        { id: 'lokasi', label: 'Lokasi' },
        { id: 'namaBarang', label: 'Nama Barang' },
        { id: 'merk', label: 'Merk' },
        { id: 'tahun', label: 'Tahun' },
        { id: 'jumlah', label: 'Jumlah' },
        { id: 'status', label: 'Status' },
        { id: 'harga', label: 'Harga' },
        { id: 'aksi', label: 'Aksi', },
    ];
    
    // Opsi untuk filter dropdown (dibuat dinamis dari data)
    const filterOptions = React.useMemo(() => ({
        gedung: [...new Set(inventoryData.map(item => item.gedung))],
        lantai: [...new Set(inventoryData.map(item => item.lantai))],
    }), [inventoryData]);

    return (
        <PageLayout
            title="Inventaris Tetap"
            onAdd={handleAddItem}
            onGenerateReport={handleGenerateReport}
        >
            {/* Menggunakan FilterBarComponent yang lebih generik */}
            <FilterBarComponent 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                options={filterOptions}
            />
            {/* Menggunakan TableComponent yang lebih generik */}
            <TableComponent
                columns={columns}
                data={processedData}
                renderActionCell={(row) => (
                    <Tooltip title="Lihat semua barang di lokasi ini">
                        <IconButton onClick={() => handleNavigateToDetail(row)}>
                            <InfoIcon sx={{ color: theme.palette.info.main }} />
                        </IconButton>
                    </Tooltip>
                )}
            />
        </PageLayout>
    );
}
