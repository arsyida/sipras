// src/app/_components/FilterSection.jsx
"use client";

import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Komponen untuk bagian pencarian dan filter dinamis.
 *
 * @param {object} props
 * @param {string} props.searchLabel - Label untuk TextField pencarian.
 * @param {string} props.searchQuery - State nilai pencarian.
 * @param {function} props.onSearchChange - Handler untuk perubahan nilai pencarian.
 * @param {Object} props.filterStates - Objek berisi state untuk setiap filter dropdown.
 * Contoh: { model: 'value', status: 'value' }
 * @param {Object} props.filterHandlers - Objek berisi handler perubahan untuk setiap filter.
 * Contoh: { onModelChange: func, onStatusChange: func }
 * @param {Array<Object>} props.dropdownFilters - Array konfigurasi untuk setiap dropdown filter.
 * Setiap objek: {
 * id: string, label: string, stateKey: string, handlerKey: string, options: Array<{value: string, label: string}>,
 * type: 'select' | 'date' (default: 'select')
 * }
 */
export default function FilterSection(props) {
  const {
    searchLabel, searchQuery, onSearchChange,
    filterStates, filterHandlers, dropdownFilters
  } = props;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      {/* Search Bar */}
      <TextField
        label={searchLabel}
        variant="outlined"
        size="medium"
        sx={{ flexGrow: 1, minWidth: '200px' }}
        value={searchQuery}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

        <DatePicker sx={{ minWidth: '120px' }}/>
      {/* Dropdown Filters Dinamis */}
      {dropdownFilters.map((filter) => (
        <React.Fragment key={filter.id}>
          {filter.type === 'select' && (
            <FormControl sx={{ minWidth: 120 }} size="medium">
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filterStates[filter.stateKey] || ''} // Pastikan ada nilai default
                label={filter.label}
                onChange={filterHandlers[filter.handlerKey]}
                IconComponent={ArrowDropDownIcon}
              >
                <MenuItem value=""><em>Semua</em></MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {/* {filter.type === 'date' && (
            <TextField
              label={filter.label}
              variant="outlined"
              size="medium"
              value={filterStates[filter.stateKey] ? filterStates[filter.stateKey].format('YYYY-MM-DD') : ''}
              onClick={() => console.log(`Open DatePicker for ${filter.label}`)} // Placeholder untuk membuka DatePicker
              InputProps={{
                  endAdornment: (
                      <InputAdornment position="end">
                          <IconButton size="small">
                              <CalendarTodayIcon />
                          </IconButton>
                      </InputAdornment>
                  ),
              }}
              sx={{ minWidth: '120px' }}
            />
          )} */}
        </React.Fragment>
      ))}
    </Box>
  );
}

FilterSection.propTypes = {
  searchLabel: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterStates: PropTypes.object.isRequired,
  filterHandlers: PropTypes.object.isRequired,
  dropdownFilters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      stateKey: PropTypes.string.isRequired,
      handlerKey: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'date']),
      options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })),
    })
  ).isRequired,
};