// src/Dashboard.js
"use client";

import React, { use } from 'react';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// --- DATA DUMMY ---
const mockData = {
    summary: {
        barangTetap: 700,
        stokSementara: 7567,
    },
    lowStock: [
        { name: 'Tinta', quantity: 140 },
        { name: 'Spion', quantity: 120 },
        { name: 'Taplak', quantity: 160 },
        { name: 'Mouse', quantity: 130 },
        { name: 'Kapur', quantity: 170 },
        { name: 'Galon', quantity: 170 },
        { name: 'Galon ', quantity: 170 },
        { name: 'Penghapus', quantity: 100 },
        { name: 'Piala', quantity: 150 },
    ],
    barangMasuk: [
        { no: 1, tanggal: '06/30/2022', nama: 'Sarpras', jabatan: 'TU', barangMasuk: 'Meja', jumlah: 70, keterangan: '-' },
        { no: 2, tanggal: '05/30/2022', nama: 'Sarpras', jabatan: 'TU', barangMasuk: 'Meja', jumlah: 70, keterangan: '-' },
    ],
    barangKeluar: [
        { no: 1, tanggal: '06/30/2022', nama: 'Ayu', jabatan: 'TU', barangKeluar: 'Meja', jumlah: 5, keterangan: '-', keperluan: 'Bendahara' },
        { no: 2, tanggal: '06/30/2022', nama: 'Ayu', jabatan: 'TU', barangKeluar: 'Meja', jumlah: 5, keterangan: '-', keperluan: 'Bendahara' },
    ],
};

// --- TEMA (STYLING) ---
const theme = createTheme({
    palette: {
        primary: { main: '#6A1B9A' },
        background: { default: '#f4f6f8' },
        text: { primary: '#333', secondary: '#666' }
    },
    typography: {
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600, margin: '0 12px' }
            }
        }
    }
});

// --- KOMPONEN UTAMA DASHBOARD ---
const DashboardPage = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
                
                {/* Konten Utama Halaman */}
                <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default, overflow: 'auto' }}>
                    
                    {/* FIX 2: Judul "Overview Barang" dipindah ke luar Grid */}
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>Overview Barang</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{borderColor: '#ddd'}}>
                                <CardContent>
                                    {/* FIX 3: Konten kartu disesuaikan dengan gambar */}
                                    <Typography color="text.secondary" gutterBottom>Barang Tetap</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{mockData.summary.barangTetap} Barang</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                             <Card variant="outlined" sx={{borderColor: '#ddd'}}>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>Stok Barang Tidak Tetap</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{mockData.summary.stokTidakTetap} Barang</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* FIX 4: Judul "Stok Persediaan Menipis" di luar Card */}
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 500 }}>Stok Persediaan Menipis</Typography>
                    <Card variant="outlined" sx={{borderColor: '#ddd'}}>
                        <CardContent>
                            <List disablePadding>
                                {mockData.lowStock.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem disablePadding sx={{ py: 1 }}>
                                            <ListItemText primary={<Typography variant="body1">{item.name}</Typography>} />
                                            <Typography variant="body1" color="text.secondary">{item.quantity} Barang</Typography>
                                        </ListItem>
                                        {index < mockData.lowStock.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    {/* Tabel Barang Masuk */}
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 500 }}>Barang Masuk</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{borderColor: '#ddd'}}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold' } }}>
                                    <TableCell>No</TableCell><TableCell>Tanggal</TableCell><TableCell>Nama</TableCell><TableCell>Jabatan</TableCell><TableCell>Barang Masuk</TableCell><TableCell>Jumlah</TableCell><TableCell>Keterangan</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockData.barangMasuk.map((row) => (
                                    <TableRow key={row.no} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{row.no}</TableCell><TableCell>{row.tanggal}</TableCell><TableCell>{row.nama}</TableCell><TableCell>{row.jabatan}</TableCell><TableCell>{row.barangMasuk}</TableCell><TableCell>{row.jumlah}</TableCell><TableCell>{row.keterangan}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    {/* Tabel Barang Keluar */}
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 500 }}>Barang Keluar</Typography>
                     <TableContainer component={Paper} variant="outlined" sx={{borderColor: '#ddd'}}>
                        <Table>
                            <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold' } }}>
                                    <TableCell>No</TableCell><TableCell>Tanggal</TableCell><TableCell>Nama</TableCell><TableCell>Jabatan</TableCell><TableCell>Barang Keluar</TableCell><TableCell>Jumlah</TableCell><TableCell>Keterangan</TableCell><TableCell>Keperluan</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockData.barangKeluar.map((row) => (
                                    <TableRow key={row.no} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{row.no}</TableCell><TableCell>{row.tanggal}</TableCell><TableCell>{row.nama}</TableCell><TableCell>{row.jabatan}</TableCell><TableCell>{row.barangKeluar}</TableCell><TableCell>{row.jumlah}</TableCell><TableCell>{row.keterangan}</TableCell><TableCell>{row.keperluan}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default DashboardPage;