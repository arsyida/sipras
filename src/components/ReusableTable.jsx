// src/app/_components/ReusableTable.jsx
"use client";

import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Komponen Tabel yang dapat digunakan kembali.
 * Props baru ditambahkan:
 * @param {function} [props.renderActionCell] - Fungsi kustom untuk merender sel aksi.
 * Jika prop ini ada, ia akan digunakan daripada onActionClick default.
 */
export default function ReusableTable(props) {
  // Tambahkan 'renderActionCell' ke dalam destructuring props
  const { columns, data, ariaLabel = "data table", showActionsColumn = false, onActionClick, renderActionCell } = props;
  const theme = useTheme();

  const actualColumns = showActionsColumn
    ? [...columns, {
        id: 'actions',
        label: 'Aksi',
        align: 'center',
        // --- PERUBAHAN UTAMA DI SINI ---
        renderCell: (rowData) => {
            return renderActionCell(rowData);
        }
      }]
    : columns;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label={ariaLabel}>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
            {actualColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{ fontWeight: 'bold' }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {actualColumns.map((column) => (
                <TableCell
                  key={`${row.id || rowIndex}-${column.id}`}
                  align={column.align || 'left'}
                >
                  {column.renderCell ? (
                    column.renderCell(row, column.id, theme)
                  ) : (
                    row[column.id]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ReusableTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      renderCell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  ariaLabel: PropTypes.string,
  showActionsColumn: PropTypes.bool,
  onActionClick: PropTypes.func,
  renderActionCell: PropTypes.func, // Tambahkan prop type baru
};
