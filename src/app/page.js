import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard') // Redirect ke halaman dashboard
  return null; // Tidak ada yang dirender karena sudah di-redirect
}