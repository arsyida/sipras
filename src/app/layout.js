import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";

import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Sipras",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <NextAuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
        {children}
        </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
