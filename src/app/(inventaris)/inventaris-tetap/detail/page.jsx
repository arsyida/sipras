"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Import komponen modular
import TableComponent from '@/components/common/TableComponent';

// MUI Components
import { Typography, Tooltip, IconButton, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllAsset } from '@/lib/services/assetServices';
import PageLayout from '@/components/common/PageLayout';

// DATA DUMMY (Harus sama dengan di halaman utama agar filtering konsisten)
const mockInventoryData = [
    { id: 'BRG001', date: '2023-01-15', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 1, status: 'Baik', gedung: 'A', lantai: '3', ruang: 'A301' },
    { id: 'BRG002', date: '2023-01-15', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 1, status: 'Baik', gedung: 'A', lantai: '3', ruang: 'A301' },
    { id: 'BRG005', date: '2023-01-16', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 1, status: 'Rusak', gedung: 'A', lantai: '3', ruang: 'A301' },
    { id: 'BRG003', date: '2023-02-10', name: 'Kursi Siswa', merk: 'Informa', year: 2021, quantity: 20, status: 'Rusak', gedung: 'B', lantai: '1', ruang: 'B102' },
    { id: 'BRG004', date: '2023-02-12', name: 'Papan Tulis', merk: 'Ikea', year: 2023, quantity: 1, status: 'Baik', gedung: 'A', lantai: '2', ruang: 'A205' },
];

export default function InventarisTetapDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [dataAssets, setDataAssets] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
                    try {
                        setLoading(true);
                        setError(null);
                        const response = await getAllAsset();
                        
                        setDataAssets(response.data || []);

                    } catch (err) {
                        console.error("Gagal memuat data aset:", err);
                        setError("Gagal memuat data aset. Silakan coba lagi nanti.");
                    } finally {
                        setLoading(false);
                    }
                };
                fetchData();
    }, []);

    // Ambil detail dari URL dan filter data
    const detailItems = React.useMemo(() => {
        const name = searchParams.get('name');
        const gedung = searchParams.get('gedung');
        const lantai = searchParams.get('lantai');
        const ruang = searchParams.get('ruang');

        if (!name || !gedung || !lantai || !ruang) return [];

        return dataAssets.filter(item => 
            item.product.name === name &&
            item.location.building === gedung &&
            item.location.floor === lantai &&
            item.location.name === ruang
        );
    }, [searchParams]);

    const pageTitle = detailItems.length > 0 ? `${detailItems[0].name}` : 'Detail Inventaris';
    const locationInfo = detailItems.length > 0 ? `Lokasi: ${detailItems[0].location.building} - ${detailItems[0].location.floor} - ${detailItems[0].location.name}` : 'Lokasi tidak ditemukan';

    const handleEditItem = (item) => console.log("Mengedit item:", item.id);
    const handleDeleteItem = (item) => console.log("Menghapus item:", item.id);

    const columns = [
        { id: 'id', label: 'Id Barang' },
        { id: 'date', label: 'Tanggal Masuk' },
        { id: 'year', label: 'Tahun' },
        { 
          id: 'status', 
          label: 'Status',
          renderCell: (row) => (
            <Typography variant="body2" sx={{ color: row.status === 'Baik' ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
              {row.status}
            </Typography>
          )
        },
    ];

    return (
        <PageLayout
            title={pageTitle}
            customActions={
                <Button variant="outlined" onClick={() => router.back()}>
                    Kembali
                </Button>
            }
        >
            <Typography variant="h6" gutterBottom>{locationInfo}</Typography>
            <TableComponent
                columns={columns}
                data={detailItems}
                renderActionCell={(row) => (
                    <Box>
                        <Tooltip title="Edit Item">
                            <IconButton onClick={() => handleEditItem(row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Item">
                            <IconButton onClick={() => handleDeleteItem(row)}>
                                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            />
        </PageLayout>
    );
}
