import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { autoLogin } from "../../service/Login-Register/User";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFC0CB",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h3: {
      fontWeight: 600,
      letterSpacing: 0.5,
    },
  },
});

export default function Navbar() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar>
          <Toolbar
            sx={{ justifyContent: "center", alignItems: "center", height: 70 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/khaa-4a9da.appspot.com/o/images%2FKayBook.png?alt=media&token=7343db5c-4cc0-4344-83d3-6522d1c14d0e"
                alt="KayBook Logo"
                style={{ width: 50, height: 50, marginRight: 15 }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  color: "#333",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                KayBook
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </ThemeProvider>
  );
}
