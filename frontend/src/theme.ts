// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      // this will be used for <Box sx={{ background: '...' }} /> defaults
      default: "linear-gradient(135deg, #4A6274 0%, #8FAAB0 100%)",
      paper: "#ffffff",           // Paper components stay white
    },
    primary: {
      main: "#5B0EED",
      light: "#7F3BFF",
      dark: "#3509A1",
    },
    text: {
      primary: "#212121",
      secondary: "#666666",
    },
  },
});

export default theme;
