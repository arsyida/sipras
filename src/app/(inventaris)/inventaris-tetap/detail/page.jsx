"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Import komponen modular
import InventoryPageLayout from '@/components/common/InventoryPageLayout';
import TableComponent from '@/components/common/TableComponent';

// MUI Components
import { Typography, Tooltip, IconButton, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllAsset } from '@/lib/services/assetServices';

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
            const assets = await getAllAsset();
            setDataAssets(assets.data);
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

        return mockInventoryData.filter(item => 
            item.name === name &&
            item.gedung === gedung &&
            item.lantai === lantai &&
            item.ruang === ruang
        );
    }, [searchParams]);

    const pageTitle = detailItems.length > 0 ? `${detailItems[0].name}` : 'Detail Inventaris';
    const locationInfo = detailItems.length > 0 ? `Lokasi: ${detailItems[0].gedung} - ${detailItems[0].lantai} - ${detailItems[0].ruang}` : 'Lokasi tidak ditemukan';

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
        <InventoryPageLayout
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
        </InventoryPageLayout>
    );
}
