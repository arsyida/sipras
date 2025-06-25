"use client";

import * as React from 'react';
import Divider from '@mui/material/Divider';

// Import komponen modular yang sama
import InventoryPageLayout from '@/components/inventory/InventoryPageLayout';
import InventoryFilterBar from '@/components/inventory/InventoryFilterBar';
import InventoryTable from '@/components/inventory/InventoryTable';
import DeleteDataModal from '@/components/DeleteDataModal';

// Cukup ganti sumber data
const nonFixedInventoryData = [
  { id: 'NT-001', date: '01/15/2023', name: 'Spidol', merk: 'Snowman', year: 2023, quantity: 50, status: 'Baik' },
  { id: 'NT-002', date: '02/20/2023', name: 'Kertas A4', merk: 'Sinar Dunia', year: 2023, quantity: 10, status: 'Baik' },
  // ... data lainnya
];

export default function InventarisTidakTetapPage() {
  // Semua state dan logic bisa SAMA PERSIS.
  // Anda hanya perlu mengganti data awal dan mungkin judul.
  
  const [filters, setFilters] = React.useState({});
  const [data, setData] = React.useState(nonFixedInventoryData); // <-- GANTI DATA
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [dataToDelete, setDataToDelete] = React.useState(null);

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };
  
  React.useEffect(() => {
    let filteredData = nonFixedInventoryData; // <-- GANTI DATA
    // Logika filter tetap sama
    if (filters.search) {
        filteredData = filteredData.filter(item => item.id.toLowerCase().includes(filters.search.toLowerCase()));
    }
    // ...
    setData(filteredData);
  }, [filters]);

  // Semua handler (handleAddItem, handleInfoClick, dll) bisa sama,
  // mungkin hanya URL navigasi atau endpoint API-nya yang berbeda.

  const handleAddItem = () => console.log("Tambah Inventaris TIDAK Tetap");
  const handleGenerateReport = () => console.log("Report Inventaris TIDAK Tetap");
  const handleInfoClick = (item) => console.log("Info item:", item);
  const handleOpenDeleteModal = (item) => { /* ... */ };
  const handleCloseDeleteModal = () => { /* ... */ };
  const handleDeleteConfirmed = (formData) => { /* ... */ };

  return (
    <InventoryPageLayout
      title="Inventaris Tidak Tetap" // <-- GANTI JUDUL
      onAdd={handleAddItem}
      onGenerateReport={handleGenerateReport}
    >
      <InventoryFilterBar filters={filters} onFilterChange={handleFilterChange} />
      <Divider flexItem />
      <InventoryTable data={data} onInfoClick={handleInfoClick} onOpenDeleteModal={handleOpenDeleteModal} />
      <DeleteDataModal open={openDeleteModal} onClose={handleCloseDeleteModal} onConfirm={handleDeleteConfirmed} item={dataToDelete} />
    </InventoryPageLayout>
  );
}