import { Button, ButtonProps } from "@mui/material";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

export const MyButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <Button LinkComponent={MyLink} {...props}>
      {children}
    </Button>
  );
};

export const MyLink: React.FC<Omit<LinkProps, "to"> & { href: string }> = ({ href, children, ...props }) => {
  return (
    <Link to={href} target={href.startsWith("http") ? "_blank" : undefined} {...props}>
      {children}
    </Link>
  );
};
