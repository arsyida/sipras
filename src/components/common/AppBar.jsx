"use client";
import * as React from "react";

// Next.js
import Image from "next/image";

// MUI
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";

// MUI Icons
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import BedIcon from "@mui/icons-material/Bed";

const drawerWidth = 260;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 0, 0, 3),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    children: null,
    href: "/dashboard", // Tambahkan href untuk navigasi
  },
  {
    text: "Inventaris",
    icon: <Inventory2Icon fontSize="small" />,
    children: [
      {
        text: "Tetap",
        icon: <ViewInArIcon fontSize="small" />,
        href: "/inventaris-tetap",
      },
      {
        text: "Sementara",
        icon: <AllInboxIcon fontSize="small" />,
        href: "/inventaris-tidak-tetap",
      },
      {
        text: "Lokasi",
        icon: <LocationOnIcon fontSize="small" />,
        href: "/inventaris/lokasi",
      },
      {
        text: "Produk",
        icon: <ViewStreamIcon fontSize="small" />,
        href: "/inventaris/produk",
      },
      {
        text: "Kategori",
        icon: <CategoryIcon fontSize="small" />,
        href: "/inventaris/kategori",
      },
      {
        text: "Merk",
        icon: <BedIcon fontSize="small" />,
        href: "/inventaris/merk",
      },
    ],
  },
  {
    text: "Mutasi",
    icon: <SwapHorizIcon fontSize="medium" />,
    children: [
      {
        text: "Masuk",
        icon: <DownloadIcon fontSize="small" />,
        href: "/mutasi-permintaan",
      },
      {
        text: "Keluar",
        icon: <UploadIcon fontSize="small" />,
        href: "/mutasi-riwayat",
      },
    ],
  },
  {
    text: "Laporan",
    icon: <AssessmentIcon fontSize="small" />,
    children: [
      {
        text: "Inv. Tetap",
        icon: <ViewInArIcon fontSize="small" />,
        href: "/laporan-inventaris",
      },
      {
        text: "Inv. Sementara",
        icon: <AllInboxIcon fontSize="small" />,
        href: "/laporan-inventaris",
      },
      {
        text: "Mutasi",
        icon: <SwapHorizIcon fontSize="small" />,
        href: "/laporan-mutasi",
      },
    ],
  },
];

// --- PERBAIKAN 1: Terima 'children' sebagai prop ---
export default function MiniDrawer({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState({});

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuClick = (text) => {
    setOpenMenus((prevOpenMenus) => ({
      ...prevOpenMenus,
      [text]: !prevOpenMenus[text],
    }));
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" open={open} >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              flexGrow: 1,
            }}
          >
            SISPRAS
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} color="primary">
        <DrawerHeader>
          <Image
            src="/Logo.svg"
            alt="Logo SMAS YP Unila"
            width={40}
            height={40}
          />
          <Typography variant="h6" sx={{ fontWeight: "bold", mr: 3, ml: 1 }}>
            YP Unila
          </Typography>
          <IconButton onClick={handleDrawerClose} color="inherit">
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItemButton
                onClick={() => {
                    item.children
                    ? handleMenuClick(item.text)
                    : (window.location.href = item.href);
                    !open && handleDrawerOpen();
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
                {item.children &&
                  open &&
                  (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              {item.children && (
                <Collapse
                  in={openMenus[item.text] && open}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton key={child.text} sx={{ pl: 4 }} href={child.href}>
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 2 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      {/* --- PERBAIKAN 2: Render children di area konten utama --- */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Spacer ini mendorong konten ke bawah AppBar */}
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
