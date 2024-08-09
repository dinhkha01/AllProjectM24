import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const MenuAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { to: "", icon: <DashboardIcon />, text: "Dashboard" },
    { to: "users", icon: <PeopleIcon />, text: "Quản lý người dùng" },
    { to: "posts", icon: <PostAddIcon />, text: "Quản lý bài đăng" },
    { to: "groups", icon: <GroupIcon />, text: "Quản lý nhóm" },
    { to: "comments", icon: <CommentIcon />, text: "Quản lý bình luận" },
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
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              color: activeItem === item.to ? "#FF69B4" : "inherit",
              textDecoration: "none",
            }}
            onClick={() => handleItemClick(item.to)}
          >
            <ListItem button>
              <ListItemIcon
                sx={{ color: activeItem === item.to ? "#FF69B4" : "inherit" }}
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
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Đăng Xuất" />
        </ListItem>
      </List>
    </Box>
  );
};

export default MenuAdmin;