// src/components/Sidebar.tsx
import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LoginIcon from "@mui/icons-material/Login";
import EventIcon from "@mui/icons-material/Event";
import TodayIcon from "@mui/icons-material/Today";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  const items: { label: string; icon: React.ReactNode; path: string }[] = [
    { label: "Sign In", icon: <LoginIcon />, path: "/" },
    { label: "Create Event", icon: <EventIcon />, path: "/create" },
    { label: "Your Availability", icon: <TodayIcon />, path: "/availability" },
    { label: "Group Availability", icon: <GroupIcon />, path: "/group" },
  ];

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{ position: "fixed", top: 16, left: 16, zIndex: 1300 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar sx={{ display: "flex", alignItems: "center", px: 2 }}>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {items.map((item) => (
            <ListItemButton
              key={item.path}
              selected={loc.pathname === item.path}
              onClick={() => {
                nav(item.path);
                setOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
