import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976D2",
    },
    secondary: {
      main: "#0D47A1",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

export default theme;
