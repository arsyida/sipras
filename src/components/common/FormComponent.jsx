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
  Button,
  Paper,
  Typography,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Komponen form dinamis yang dapat menampilkan error validasi per field.
 * @param {array} formConfig - Konfigurasi untuk setiap field di form.
 * @param {object} formData - State yang menyimpan nilai dari setiap field.
 * @param {object} errors - Objek yang berisi pesan error untuk setiap field.
 * @param {function} onFormChange - Handler untuk memperbarui state.
 * @param {function} onSubmit - Handler saat tombol 'Simpan' ditekan.
 * @param {function} onCancel - Handler saat tombol 'Batal' ditekan.
 * @param {boolean} isSubmitting - Status apakah form sedang dalam proses pengiriman.
 * @param {string} title - Judul yang ditampilkan di atas form.
 */
export default function FormComponent({
  formConfig,
  formData,
  errors = {},
  onFormChange,
  onSubmit,
  onCancel,
  isSubmitting = false, // Tambahkan prop isSubmitting
  title
}) {

  // ... (handler dan renderInputField tetap sama)

  const handleInputChange = (event) => {
    onFormChange(event.target.name, event.target.value);
  };

  const handleDateChange = (name, newValue) => {
    onFormChange(name, newValue);
  };

  const renderInputField = (fieldConfig) => {
    const { name, label, type, options = [], required = false, rows = 1 } = fieldConfig;
    const value = formData[name] || '';
    const hasError = !!errors[name];
    const errorMessage = Array.isArray(errors[name]) ? errors[name][0] : errors[name] || '';


    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth required={required} error={hasError}>
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              value={value}
              label={label}
              onChange={handleInputChange}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );

      case 'textarea':
      case 'number':
      case 'text':
      default:
        return (
          <TextField
            fullWidth
            required={required}
            type={type === 'number' ? 'number' : 'text'}
            multiline={type === 'textarea'}
            rows={type === 'textarea' ? (rows > 1 ? rows : 4) : undefined}
            name={name}
            label={label}
            value={value}
            onChange={handleInputChange}
            error={hasError}
            helperText={errorMessage}
          />
        );
      
      case 'date':
        return (
          <DatePicker
            label={label}
            value={value || null}
            onChange={(newValue) => handleDateChange(name, newValue)}
            renderInput={(params) => 
              <TextField 
                {...params} 
                fullWidth 
                required={required}
                error={hasError}
                helperText={errorMessage}
              />}
          />
        );
    }
  };

  return (
      <Paper component="form" sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }} variant="outlined">
        {title && (
          <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        <Box display="flex" flexDirection="column" justifyContent="center" mb={2}>
          {formConfig.map((field) => (
            <Box key={field.name} sx={{ mb: 2 }}>
              {renderInputField(field)}
            </Box>
          ))}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="text" color="secondary" onClick={onCancel}>
                Batal
              </Button>
              <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
  );
}
