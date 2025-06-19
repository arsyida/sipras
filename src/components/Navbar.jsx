"use client";

import { useState } from "react";
import { signOut } from "next-auth/react"; // Import signOut dari next-auth/react
import { redirect } from 'next/navigation'; // Import redirect untuk navigasi
import Link from "next/link";

// component MUI
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from '@mui/material/Toolbar';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Icon untuk expand/collapse di Drawer
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import PropTypes from 'prop-types'; // Import PropTypes

const drawerWidth = 240;

function DrawerAppBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- STATE UNTUK MENU "INVENTARIS" (Desktop) ---
  const [inventarisAnchorEl, setInventarisAnchorEl] = useState(null);
  const openInventaris = Boolean(inventarisAnchorEl);

  const handleInventarisClick = (event) => {
    setInventarisAnchorEl(event.currentTarget);
  };
  const handleInventarisClose = () => {
    setInventarisAnchorEl(null);
  };

  // --- STATE UNTUK MENU "MUTASI" (Desktop) ---
  const [mutasiAnchorEl, setMutasiAnchorEl] = useState(null);
  const openMutasi = Boolean(mutasiAnchorEl);

  const handleMutasiClick = (event) => {
    setMutasiAnchorEl(event.currentTarget);
  };
  const handleMutasiClose = () => {
    setMutasiAnchorEl(null);
  };

  // --- STATE UNTUK MENU "INVENTARIS" (Mobile Drawer) ---
  const [openInventarisDrawer, setOpenInventarisDrawer] = useState(false);
  const handleInventarisDrawerClick = () => {
    setOpenInventarisDrawer(!openInventarisDrawer);
  };

  // --- STATE UNTUK MENU "MUTASI" (Mobile Drawer) ---
  const [openMutasiDrawer, setOpenMutasiDrawer] = useState(false);
  const handleMutasiDrawerClick = () => {
    setOpenMutasiDrawer(!openMutasiDrawer);
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
    // Tutup sub-menu drawer saat drawer utama ditutup
    if (mobileOpen) {
      setOpenInventarisDrawer(false);
      setOpenMutasiDrawer(false);
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Image
        src="/Logo.svg"
        alt="Logo SMAS YP Unila"
        width={50} // Ukuran konsisten dengan AppBar utama
        height={50} // Ukuran konsisten dengan AppBar utama
        style={{ marginTop: '16px', marginBottom: '8px' }}
      />
      <Typography variant="h6" sx={{ my: 2 }}>
        SIPRAS
      </Typography>
      <Divider />
      <List>
        {/* Dashboard Link (Mobile Drawer) */}
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard" sx={{ textAlign: "center", textTransform: "none" }}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* Inventaris Menu (Mobile Drawer) */}
        <ListItemButton onClick={handleInventarisDrawerClick} sx={{ textAlign: "center", textTransform: "none" }}>
          <ListItemText primary="Inventaris" />
          {openInventarisDrawer ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openInventarisDrawer} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} href="/inventaris-tetap" sx={{ pl: 4, textAlign: "center", textTransform: "none" }}>
              <ListItemText primary="Inventaris Tetap" />
            </ListItemButton>
            <ListItemButton component={Link} href="/inventaris-tidak-tetap" sx={{ pl: 4, textAlign: "center", textTransform: "none" }}>
              <ListItemText primary="Inventaris Tidak Tetap" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Mutasi Menu (Mobile Drawer) */}
        <ListItemButton onClick={handleMutasiDrawerClick} sx={{ textAlign: "center", textTransform: "none" }}>
          <ListItemText primary="Mutasi" />
          {openMutasiDrawer ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMutasiDrawer} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} href="/mutasi-barang-masuk" sx={{ pl: 4, textAlign: "center", textTransform: "none" }}>
              <ListItemText primary="Barang Masuk" />
            </ListItemButton>
            <ListItemButton component={Link} href="/mutasi-barang-keluar" sx={{ pl: 4, textAlign: "center", textTransform: "none" }}>
              <ListItemText primary="Barang Keluar" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Laporan Link (Mobile Drawer) */}
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/laporan" sx={{ textAlign: "center", textTransform: "none" }}>
            <ListItemText primary="Laporan" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav" sx={{ px: 5 }} color="primary"> {/* Tambahkan color="primary" */}
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Image
            src="/Logo.svg"
            alt="Logo SMAS YP Unila"
            width={50}
            height={50}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              ml: 1,
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
            }}
          >
            SIPRAS
          </Typography>
          <Box
            sx={{
              display: { xs: "none", sm: "block", lg: "flex" }, // Ensure it's flex for lg
              ml: 'auto', // Push items to the right
              gap: 2, // Optional: Spacing between buttons
            }}
          >
            {/* Desktop Navigation Buttons */}
            <Button
              key="dashboard"
              component={Link} // Gunakan Link untuk navigasi
              href="/dashboard"
              sx={{
                fontSize: 16,
                color: "#fff",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Dashboard
            </Button>

            {/* Desktop Inventaris Button & Menu */}
            <Button
              id="inventaris-button"
              aria-controls={openInventaris ? "inventaris-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openInventaris ? "true" : undefined}
              onClick={handleInventarisClick}
              key="inventaris"
              sx={{
                fontSize: 16,
                color: "#fff",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Inventaris
            </Button>
            <Menu
              id="inventaris-menu"
              anchorEl={inventarisAnchorEl}
              open={openInventaris}
              onClose={handleInventarisClose}
              slotProps={{
                list: {
                  "aria-labelledby": "inventaris-button",
                },
              }}
            >
              <MenuItem onClick={handleInventarisClose} component={Link} href="/inventaris-tetap">Inventaris Tetap</MenuItem>
              <MenuItem onClick={handleInventarisClose} component={Link} href="/inventaris-tidak-tetap">Inventaris Tidak Tetap</MenuItem>
            </Menu>

            {/* Desktop Mutasi Button & Menu */}
            <Button
              id="mutasi-button"
              aria-controls={openMutasi ? "mutasi-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMutasi ? "true" : undefined}
              onClick={handleMutasiClick}
              key="mutasi"
              sx={{
                fontSize: 16,
                color: "#fff",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Mutasi
            </Button>
            <Menu
              id="mutasi-menu"
              anchorEl={mutasiAnchorEl}
              open={openMutasi}
              onClose={handleMutasiClose}
              slotProps={{
                list: {
                  "aria-labelledby": "mutasi-button",
                },
              }}
            >
              <MenuItem onClick={handleMutasiClose} component={Link} href="/mutasi-barang-masuk">Barang Masuk</MenuItem>
              <MenuItem onClick={handleMutasiClose} component={Link} href="/mutasi-barang-keluar">Barang Keluar</MenuItem>
            </Menu>

            {/* Desktop Laporan Button */}
            <Button
              key="laporan"
              component={Link} // Gunakan Link untuk navigasi
              href="/laporan"
              sx={{
                fontSize: 16,
                color: "#fff",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Laporan
            </Button>
            <Button
              onClick={() => {
                signOut();
                redirect('/login');
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box >
  );
}

DrawerAppBar.propTypes = {
  window: PropTypes.func,
};

export default DrawerAppBar;