import React, { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";

import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { markAllNotificationsAsRead } from "../../service/Login-Register/User";


const MenuUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  const menuItems = [
    { to: "/", icon: <HomeIcon />, text: "Trang chủ" },
    { to: "frends", icon: <VideoLibraryIcon />, text: "Bạn Bè" },
    { to: "group", icon: <MailIcon />, text: "Nhóm" },
    { to: "notify", icon: <NotificationsIcon />, text: "Thông báo" },
    { to: "profile", icon: <AccountCircle />, text: "Trang cá nhân" },
  ];

  useEffect(() => {
    if (currentUser && currentUser.notyfi) {
      const newNotifications = currentUser.notyfi.filter(notif => !notif.status);
      setNewNotificationsCount(newNotifications.length);
    }
  }, [currentUser]);

  const handleItemClick = (to: string) => {
    setActiveItem(to);
    if (to === "notify") {
      handleViewNotifications();
    }
  };

  const handleViewNotifications = () => {
    if (currentUser) {
      dispatch(markAllNotificationsAsRead(currentUser.id));
    }
    setNewNotificationsCount(0);
  };

  const handleLogout = () => {
    navigate("/login");
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
                {item.to === "notify" && newNotificationsCount > 0 ? (
                  <Badge badgeContent={newNotificationsCount} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
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

export default MenuUser;