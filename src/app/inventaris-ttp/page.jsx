"use client";

import * as React from 'react';
import Divider from '@mui/material/Divider';

// Import komponen modular
import InventoryPageLayout from '@/components/inventory/InventoryPageLayout';
import InventoryFilterBar from '@/components/inventory/InventoryFilterBar';
import InventoryTable from '@/components/inventory/InventoryTable';
import DeleteDataModal from '@/components/DeleteDataModal';

// Data bisa berasal dari API call di dunia nyata
const fixedInventoryData = [
  { id: 'G.A/L/RII/Me005', date: '06/30/2022', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 3, status: 'Baik' },
  { id: 'G.A/L/RII/Me006', date: '06/30/2022', name: 'Meja Belajar', merk: 'Ikea', year: 2022, quantity: 3, status: 'Baik' },
  // ... data lainnya
];

export default function InventarisTetapPage() {
  const [filters, setFilters] = React.useState({});
  const [data, setData] = React.useState(fixedInventoryData); // State untuk data tabel
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [dataToDelete, setDataToDelete] = React.useState(null);

  // Fungsi untuk menangani perubahan filter
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  // Di sini Anda akan menerapkan logika filter ke data
  // Contoh sederhana:
  React.useEffect(() => {
    let filteredData = fixedInventoryData;
    if (filters.search) {
      filteredData = filteredData.filter(item => item.id.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.merk) {
      filteredData = filteredData.filter(item => item.merk === filters.merk);
    }
    if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
    }
    // Tambahkan filter lain di sini...
    setData(filteredData);
  }, [filters]);


  // Logika untuk Aksi
  const handleAddItem = () => {
    console.log("Membuka halaman tambah inventaris tetap...");
    // navigate('/inventaris/tetap/tambah');
  };

  const handleGenerateReport = () => {
    console.log("Membuat laporan untuk inventaris tetap...");
  };

  const handleInfoClick = (item) => {
    console.log("Menampilkan detail untuk:", item);
    // navigate(`/inventaris/tetap/detail/${item.id}`);
  };

  const handleOpenDeleteModal = (item) => {
    setDataToDelete(item);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDataToDelete(null);
  };

  const handleDeleteConfirmed = (formData) => {
    console.log('Data yang akan dihapus:', dataToDelete);
    console.log('Informasi tambahan:', formData);
    // Logika penghapusan data...
    handleCloseDeleteModal();
  };

  return (
    <InventoryPageLayout
      title="Inventaris Tetap"
      onAdd={handleAddItem}
      onGenerateReport={handleGenerateReport}
    >
      <InventoryFilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <Divider flexItem />

      <InventoryTable
        data={data}
        onInfoClick={handleInfoClick}
        onOpenDeleteModal={handleOpenDeleteModal} // Pass fungsi ini ke tabel
      />

      {/* Modal tetap dikelola di level halaman */}
      <DeleteDataModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirmed}
        item={dataToDelete} // Kirim item yang relevan ke modal
      />
    </InventoryPageLayout>
  );
}