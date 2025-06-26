"use client";

import * as React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Komponen Filter Bar dinamis yang merender input berdasarkan konfigurasi.
 * @param {object} filters - State yang menyimpan nilai dari setiap filter.
 * @param {function} onFilterChange - Handler untuk memperbarui state. Dipanggil dengan (name, value).
 * @param {array} filterConfig - Konfigurasi untuk setiap field di filter bar.
 */
export default function FilterBarComponent({
  filters,
  onFilterChange,
  filterConfig = [] // Berikan nilai default array kosong
}) {

  const handleInputChange = (event) => {
    onFilterChange(event.target.name, event.target.value);
  };

  const renderFilterField = (field) => {
    const { name, label, type, options = [] } = field;
    const value = filters[name] || '';

    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth size="medium" sx={{ minWidth: 120 }} variant="outlined">
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              value={value}
              label={label}
              onChange={handleInputChange}
            >
              <MenuItem value=""><em>Semua</em></MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'text':
      default:
        return (
          <TextField
            fullWidth
            name={name}
            label={label}
            variant="outlined"
            size="medium"
            value={value}
            onChange={handleInputChange}
            InputProps={name.toLowerCase().includes('search') ? {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            } : null}
          />
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Filter
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {filterConfig.map((field) => (
          <Grid item xs={12} sm={6} md={3} key={field.name}>
            {renderFilterField(field)}
          </Grid>
        ))}
      </Grid>
    </Box>
    
  );
}
