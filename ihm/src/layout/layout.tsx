import { createTheme, ThemeProvider } from "@mui/material";
import { grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1a213d",
    },
    secondary: {
      main: "#d14f34",
    },
    text: {
      primary: "#fcefb2",
      secondary: "#3577bc",
    },
    action: {
      disabled: grey[500],
    },
  },
});

export const ThemeDevfest: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
