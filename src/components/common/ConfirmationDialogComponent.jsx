"use client";

import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

/**
 * A reusable confirmation dialog component.
 * @param {boolean} open - Whether the dialog is open.
 * @param {function} onClose - Function to call when the dialog is closed (e.g., clicking away or 'Batal').
 * @param {function} onConfirm - Function to call when the 'Konfirmasi' button is clicked.
 * @param {string} title - The title of the dialog.
 * @param {string} message - The main content/message of the dialog.
 */
export default function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Batal
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
          Konfirmasi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
