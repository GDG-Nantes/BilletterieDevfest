import { AppBar, createTheme, ThemeProvider, Toolbar } from "@mui/material";
import { grey } from "@mui/material/colors";
import "./style.scss";
import React from "react";

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

export const Navbar: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return (
    <AppBar position="static" sx={{ marginBottom: "20px" }}>
      <Toolbar>
        <img src="/logo-long-jaune.svg" height={60} style={{ marginRight: "50px" }} />
        <h1 style={{ flexGrow: 1 }}>{title}</h1>
        {children}
      </Toolbar>
    </AppBar>
  );
};
