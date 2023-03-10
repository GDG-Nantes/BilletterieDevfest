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

export const MyLink = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to"> & { href: string }>(
  ({ href, children, ...props }, ref) => {
    return (
      <Link to={href} ref={ref} target={href.startsWith("http") ? "_blank" : undefined} {...props}>
        {children}
      </Link>
    );
  }
);
