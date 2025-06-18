import React from "react";
import DrawerAppBar from "@/components/Navbar";
import MuiProviders from '@/app/provider';

export const metadata = {
  title: "Sipras",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MuiProviders>
          <DrawerAppBar />
          {children}
        </MuiProviders>
      </body>
    </html>
  );
};