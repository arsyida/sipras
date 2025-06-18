"use client"; // Ini adalah Client Component

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper'; // Digunakan untuk kartu login dengan elevasi
import Image from 'next/image'; // Komponen Image dari Next.js
import { useTheme } from '@mui/material/styles'; // Untuk mengakses warna dari theme MUI

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput'; // Karena variant="outlined"
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const BACKGROUND_IMAGE_PATH = '/background.png';
const SCHOOL_LOGO_PATH = '/Logo.svg';

export default function LoginPage() {
  const theme = useTheme(); // Akses theme Anda

  // Anda bisa tambahkan state untuk email dan password di sini
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();
    // Logika login Anda di sini
    console.log('Email:', email, 'Password:', password);
    // Contoh: Kirim data ke API backend
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    // Box utama yang menjadi container seluruh halaman, dengan background image
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Pusatkan vertikal
        alignItems: 'center',     // Pusatkan horizontal
        minHeight: '100vh',       // Ambil tinggi viewport penuh
        backgroundImage: `url(${BACKGROUND_IMAGE_PATH})`,
        backgroundSize: 'cover',   // Gambar menutupi seluruh area
        backgroundPosition: 'center', // Pusatkan gambar background
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Container untuk Card Login */}
      <Paper
        elevation={6} // Memberi efek bayangan pada kartu
        sx={{
          p: { xs: 3, sm: 4 }, // Padding responsif
          borderRadius: 2,    // Sudut membulat
          width: { xs: '90%', sm: '400px' }, // Lebar responsif
          maxWidth: '400px',  // Batasi lebar maksimal
          textAlign: 'center', // Pusatkan teks di dalam kartu
          backgroundColor: 'white', // Pastikan background putih
        }}
      >
        {/* Logo Sekolah */}
        <Image
          src={SCHOOL_LOGO_PATH}
          alt="Logo SMA YP Unila"
          width={80} // Sesuaikan ukuran logo agar terlihat jelas
          height={80}
          style={{ marginBottom: theme.spacing(2) }} // Spasi di bawah logo
        />

        {/* Teks Login */}
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Login
        </Typography>

        {/* Teks Selamat Datang */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selamat Datang Kembali
        </Typography>

        {/* Form Input */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            variant="outlined" // Sesuai dengan gaya di gambar
            size="medium" // Ukuran input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }} // Spasi di bawah input
          />
         <FormControl
            margin="normal"
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 3 }} // Spasi di bawah input dan sebelum tombol
          >
            <InputLabel htmlFor="password-field">Password</InputLabel>
            <OutlinedInput // Menggunakan OutlinedInput secara langsung
              id="password-field" // ID ini harus sesuai dengan htmlFor di InputLabel
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              label="Password" // Label ini penting untuk OutlinedInput
              endAdornment={ // endAdornment adalah properti langsung dari OutlinedInput
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          {/* Tombol Sign In */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: 1.5, // Padding vertikal tombol
              backgroundColor: theme.palette.primary.main, // Menggunakan warna primary dari theme
              '&:hover': {
                backgroundColor: theme.palette.primary.dark, // Varian gelap saat hover
              },
              fontWeight: 'bold',
            }}
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}