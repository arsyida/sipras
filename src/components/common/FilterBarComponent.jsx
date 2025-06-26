"use client";

import * as React from 'react';
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function FilterBarComponent({ filters, onFilterChange }) {
  // Merk dan Status options bisa di-pass sebagai props jika berbeda antar halaman
  const merkOptions = ['Ikea', 'Informasi'];
  const statusOptions = ['Baik', 'Rusak'];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      <TextField
        label="Cari Nama Barang"
        variant="outlined"
        size="medium"
        sx={{ flexGrow: 1, minWidth: '200px' }}
        value={filters.search || ''}
        onChange={(e) => onFilterChange('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <DatePicker 
        sx={{ minWidth: '120px' }}
        value={filters.date || null}
        onChange={(newValue) => onFilterChange('date', newValue)}
      />

      {/* Dropdown Merk */}
      <FormControl sx={{ minWidth: 120 }} size="medium">
        <InputLabel>Merk</InputLabel>
        <Select
          value={filters.merk || ''}
          label="Merk"
          onChange={(e) => onFilterChange('merk', e.target.value)}
          IconComponent={ArrowDropDownIcon}
        >
          <MenuItem value=""><em>Semua</em></MenuItem>
          {merkOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Dropdown Status */}
      <FormControl sx={{ minWidth: 120 }} size="medium">
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => onFilterChange('status', e.target.value)}
          IconComponent={ArrowDropDownIcon}
        >
          <MenuItem value=""><em>Semua</em></MenuItem>
          {statusOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}