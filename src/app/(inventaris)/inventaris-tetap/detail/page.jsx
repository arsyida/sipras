// src/app/inventaris/tetap/page.jsx
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { Typography, Box, IconButton, Tooltip, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import ReusableTable from '@/components/ReusableTable';
import { useTheme } from '@mui/material/styles';


export default function InventarisTetapPage({ filters = {} }) {
  const theme = useTheme();
  const router = useRouter();

  const [inventoryData, setInventoryData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/api/assets');
        
        // **PERBAIKAN 1: Format data untuk menyamakan `_id` menjadi `id`**
        // Ini membuat data kompatibel dengan ReusableTable yang mengharapkan `id`
        const formattedData = response.data.data.map(item => ({
          ...item,
          id: item._id 
        }));
        
        setInventoryData(formattedData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (item) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${item.product.name}?`)) {
      try {
        await axios.delete(`/api/assets/${item.id}`); // Menggunakan item.id yang sudah kita format
        setInventoryData(prevData => prevData.filter(dataItem => dataItem.id !== item.id));
        console.log(`Item dengan ID: ${item.id} berhasil dihapus.`);
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Gagal menghapus item.");
      }
    }
  };

  // **PERBAIKAN 2: Definisikan kolom untuk mengakses data nested dengan `renderCell`**
  const columns = [
    { id: 'no', label: 'No' },
    {
      id: 'productName', // ID unik untuk kolom
      label: 'Nama Barang',
      renderCell: (row) => row.product?.name || 'N/A' // Akses: row -> product -> name
    },
    {
      id: 'building',
      label: 'Gedung',
      renderCell: (row) => row.location?.building || 'N/A' // Akses: row -> location -> building
    },
    {
      id: 'floor',
      label: 'Lantai',
      renderCell: (row) => row.location?.floor || 'N/A' // Akses: row -> location -> floor
    },
    {
      id: 'room',
      label: 'Ruang',
      renderCell: (row) => row.location?.name || 'N/A' // Akses: row -> location -> name
    },
    {
      id: 'condition', // **PERBAIKAN 3:** ID ini sekarang 'condition' untuk mencocokkan data
      label: 'Status'
    },
  ];
  
  const filteredData = React.useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return inventoryData;
    }
    return inventoryData.filter(item => {
      // Implementasikan logika filter kompleks Anda di sini
      return true; 
    });
  }, [inventoryData, filters]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Memuat data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ReusableTable
        columns={columns}
        data={filteredData}
        ariaLabel={`Tabel Inventaris Tetap`}
        showActionsColumn={true}
        renderActionCell={(row) => (
          <Tooltip title="Hapus Barang Ini">
            <IconButton onClick={() => handleDelete(row)}>
              <DeleteIcon sx={{ color: theme.palette.error.main }} />
            </IconButton>
          </Tooltip>
        )}
      />
    </Box>
  );
}
