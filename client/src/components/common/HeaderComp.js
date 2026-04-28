import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import { Grid, Box } from "@mui/material";
import { Typography } from "@mui/material";
import NavBarLogo from "./NavBarLogo";

export const HeaderComp = () => {

  const { user } = useAuth();

  const [displayname, setDisplayname] = useState("Guest");

  useEffect(() => {
    if (user) {
      if (user.displayName) {
        setDisplayname(user.displayName);
      } else if (user.email) {
        setDisplayname(user.email.split("@")[0]);
      }
    }
  }, [user]);

  return (
    <>
      <Grid
        item
        sx={{
          pl: 2,
          pr: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo on the left */}
        <NavBarLogo />

        {/* User on the right */}
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary">
            Welcome,&nbsp;<strong>{displayname}</strong>
          </Typography>
        </Box>
      </Grid>

    </>
  );
};
