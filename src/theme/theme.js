"use client";
import { Inter } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const inter = Inter({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
})

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: inter.style.fontFamily,
    },
    palette: {
        primary: {
            main: "#1976d2",
            contrastText: "#fff",
        },
        secondary: {
            main: "#dc004e",
            contrastText: "#fff",
        },
        background: {
            default: "#f5f5f5",
            paper: "#fff",
        },
    },
});

export default theme;