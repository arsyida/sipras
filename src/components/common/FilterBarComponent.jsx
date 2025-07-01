"use client";

import * as React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
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
  const handleCheckboxChange = (event) => {
    onFilterChange(event.target.name, event.target.checked);
  };

  // PERBAIKAN: Handler baru khusus untuk DatePicker
  const handleDateChange = (name, newValue) => {
    onFilterChange(name, newValue);
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
        case 'checkbox':
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        name={name}
                        checked={!!value}
                        onChange={handleCheckboxChange}
                    />
                }
                label={label}
            />
        );
      case 'date':
        return (
            <DatePicker
                label={label}
                value={value || null} // DatePicker mengharapkan null, bukan string kosong
                onChange={(newValue) => handleDateChange(name, newValue)}
                renderInput={(params) => <TextField {...params} size="medium" fullWidth />}
            />
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
          <Grid key={field.name}>
            {renderFilterField(field)}
          </Grid>
        ))}
      </Grid>
    </Box>
    
  );
}
