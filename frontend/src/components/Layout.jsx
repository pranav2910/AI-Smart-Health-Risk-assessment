import { useNavigate } from "react-router-dom";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";

const drawerWidth = 240;

export default function Layout({ children }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#0D47A1",
            color: "white",
            border: "none",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI Agent
          </Typography>
        </Toolbar>

        <List>
          <ListItem button onClick={() => navigate("/")}>
            <ListItemIcon sx={{ color: "white" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Predict" />
          </ListItem>

          <ListItem button onClick={() => navigate("/trends")}>
            <ListItemIcon sx={{ color: "white" }}>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText primary="Trends" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#F5F7FA",
          minHeight: "100vh",
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            backgroundColor: "white",
            borderBottom: "1px solid #E0E0E0",
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ color: "#0D47A1", fontWeight: 600 }}
            >
              AI Diabetes Prediction System
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ padding: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
}