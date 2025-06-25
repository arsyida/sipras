// src/app/_components/PageHeaderWithActionButton.jsx
"use client";

import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';

/**
 * Komponen untuk header halaman dengan judul dan tombol aksi "+ Tambahkan".
 *
 * @param {object} props
 * @param {string} props.title - Judul halaman yang akan ditampilkan.
 * @param {string} props.addLinkHref - URL untuk tombol "+ Tambahkan".
 */
export default function HeaderSection(props) {
  const { title, addLinkHref } = props;
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box>
        {/* Tombol Laporan jika diperlukan bisa ditambahkan di sini juga dengan prop opsional */}
        <Button
          variant="contained"
          component={Link}
          href={addLinkHref}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          + Tambahkan
        </Button>
      </Box>
    </Box>
  );
}

HeaderSection.propTypes = {
  title: PropTypes.string.isRequired,
  addLinkHref: PropTypes.string.isRequired,
};