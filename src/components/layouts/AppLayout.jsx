"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/common/AppBar";


/** * Komponen layout utama untuk aplikasi.
 * Menggunakan usePathname untuk menentukan apakah akan menampilkan Navbar atau tidak.
 * @param {React.ReactNode} children - Konten utama dari halaman.
 */
export default function AppLayout({ children }) {
  const pathName = usePathname();

  return (
    <>
      {pathName === "/login" ? children : <Navbar>{children}</Navbar>}
    </>
  );
}