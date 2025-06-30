import React, { use } from "react";
import Providers from "@/components/providers/provider";

export const metadata = {
  title: "Sipras",
  description: "Sistem Informasi Pengelolaan Barang Inventaris SMA YP Unila",
  icons: {
    icon: "/Logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
