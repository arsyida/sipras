"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  IconButton,
  InputAdornment,
  Alert, // Impor komponen Alert
  CircularProgress // Impor komponen CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const BACKGROUND_IMAGE_PATH = '/background.png';
const SCHOOL_LOGO_PATH = '/Logo.svg';

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State untuk loading
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Mulai loading

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (result.error) {
        setError('Username atau password salah. Silakan coba lagi.');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Gagal terhubung ke server.');
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `url(${BACKGROUND_IMAGE_PATH})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          width: { xs: '90%', sm: '400px' },
          maxWidth: '400px',
          textAlign: 'center',
          backgroundColor: 'white',
        }}
      >
        <Image
          src={SCHOOL_LOGO_PATH}
          alt="Logo SMA YP Unila"
          width={80}
          height={80}
          style={{ marginBottom: theme.spacing(2) }}
        />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selamat Datang Kembali
        </Typography>

        {/* --- PENANGANAN ERROR VISUAL DI SINI --- */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%', textAlign: 'left' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading} // Disable saat loading
            sx={{ mb: 2 }}
          />
          <FormControl
            margin="normal"
            required
            fullWidth
            variant="outlined"
            disabled={loading} // Disable saat loading
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="password-field">Password</InputLabel>
            <OutlinedInput
              id="password-field"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              label="Password"
              endAdornment={
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading} // Disable tombol saat loading
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              fontWeight: 'bold',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}