"use client";

import * as React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BreadcrumbsComponent from '@/components/common/BreadcrumbsComponent';

export default function InventoryPageLayout({ title, onAdd, onGenerateReport, children }) {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{p:2}}>
      <BreadcrumbsComponent />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={onGenerateReport}
            sx={{
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              mr: 2,
              '&:hover': { borderColor: theme.palette.primary.dark },
            }}
          >
            Laporan
          </Button>
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}
          >
            + Tambahkan
          </Button>
        </Box>
      </Box>
      <Divider flexItem sx={{ bgcolor: theme.palette.secondary.main }} />
      {children}
    </Box>
  );
}