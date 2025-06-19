import React from "react";
import DrawerAppBar from "@/components/Navbar";
import Providers from '@/components/providers/provider';

export const metadata = {
  title: "Sipras",
  description: "Sistem Informasi Pengelolaan Barang Inventaris SMA YP Unila",
  icons: {
    icon: "/Logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <DrawerAppBar />
          {children}
        </Providers>
      </body>
    </html>
  );
};