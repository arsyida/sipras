"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import ConfirmationDialog from '@/components/common/ConfirmationDialogComponent'; // Impor komponen yang baru dibuat

// Buat Context
const ConfirmationContext = createContext();

// Buat custom hook untuk kemudahan penggunaan
export const useConfirmation = () => {
    return useContext(ConfirmationContext);
};

// Buat Provider
export function ConfirmationDialogProvider({ children }) {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const showConfirmation = useCallback((title, message, onConfirm) => {
        setDialogState({
            isOpen: true,
            title,
            message,
            onConfirm,
        });
    }, []);

    const handleClose = () => {
        setDialogState({ ...dialogState, isOpen: false });
    };

    const handleConfirm = () => {
        dialogState.onConfirm();
        handleClose();
    };

    const value = { showConfirmation };

    return (
        <ConfirmationContext.Provider value={value}>
            {children}
            <ConfirmationDialog
                open={dialogState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={dialogState.title}
                message={dialogState.message}
            />
        </ConfirmationContext.Provider>
    );
}
