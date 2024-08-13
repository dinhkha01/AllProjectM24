import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const MenuAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { to: "", icon: <PeopleIcon />, text: "Quản lý người dùng" },
    { to: "posts", icon: <PostAddIcon />, text: "Quản lý bài đăng" },
    { to: "groups", icon: <GroupIcon />, text: "Quản lý nhóm" },
  ];

  const handleItemClick = (to: string) => {
    setActiveItem(to);
  };

  const handleLogout = () => {
    navigate("/login");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
  };

  return (
    <Box 
      sx={{ 
        width: 200, 
        backgroundColor: "#FFF0F5",
        height: "100%",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }} 
      role="presentation"
    >
      <List sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
            onClick={() => handleItemClick(item.to)}
          >
            <ListItem 
              button 
              sx={{
                backgroundColor: activeItem === item.to ? "#FF69B4" : "transparent",
                "&:hover": {
                  backgroundColor: "#FFB6C1",
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 0',
              }}
            >
              <ListItemIcon
                sx={{ 
                  color: activeItem === item.to ? "#FFF" : "#FF69B4",
                  minWidth: 'auto',
                  marginBottom: '8px'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: activeItem === item.to ? "#FFF" : "#000",
                  "& .MuiTypography-root": {
                    fontWeight: activeItem === item.to ? "bold" : "normal",
                    textAlign: 'center',
                  }
                }}
              />
            </ListItem>
          </NavLink>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            "&:hover": {
              backgroundColor: "#FFB6C1",
            },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
          }}
        >
          <ListItemIcon sx={{ color: "#FF69B4", minWidth: 'auto', marginBottom: '8px' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Đăng Xuất" 
            sx={{
              "& .MuiTypography-root": {
                textAlign: 'center',
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default MenuAdmin;