import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout"; // Thêm icon đăng xuất
import { Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";

const MenuUser = () => {
  const location = useLocation();
  const Navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { to: "/", icon: <HomeIcon />, text: "Trang chủ" },
    { to: "frends", icon: <VideoLibraryIcon />, text: "Bạn Bè" },
    { to: "group", icon: <MailIcon />, text: "Nhóm" },
    { to: "notify", icon: <NotificationsIcon />, text: "Thông báo" },
    { to: "profile", icon: <AccountCircle />, text: "Trang cá nhân" },
  ];

  const handleItemClick = (to: any) => {
    setActiveItem(to);
  };
  const handleLogout = () => {
    Navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  return (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              color: activeItem === item.to ? "pink" : "inherit",
              textDecoration: "none",
            }}
            onClick={() => handleItemClick(item.to)}
          >
            <ListItem button>
              <ListItemIcon
                sx={{ color: activeItem === item.to ? "pink" : "inherit" }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </NavLink>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText onClick={handleLogout} primary="Đăng Xuất" />
        </ListItem>
      </List>
    </Box>
  );
};

export default MenuUser;
