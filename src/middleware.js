export { default } from "next-auth/middleware";

// Konfigurasi ini menentukan halaman mana yang akan dilindungi oleh middleware.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventaris-tetap/:path*',
    '/inventaris-tidak-tetap/:path*',
    '/mutasi-barang-keluar/:path*',
    '/mutasi-barang-masuk/:path*',
    '/laporan/:path*',
  ],
};