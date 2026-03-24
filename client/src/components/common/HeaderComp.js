import React, { createRef, Fragment, useEffect, useRef, useState } from "react";
import { makeStyles } from "@mui/styles";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";

import { Grid, Box } from "@mui/material";
import { Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  logo: {
    padding: "10px",
    fontSize: "medium",
    fontWeight: 700,
    color: "#575656",
    lineHeight: "2vh",
    fontFamily: "system-ui",
    cursor: 'pointer',
  },
  logoimg: {
    width: "150px",
    height: "auto",
  },
  webmap: {
    "& .esri-ui": {
      zIndex: 100,
    },
    "& .esri-ui .esri-popup": {
      zIndex: 100,
    },
    "& .esri-popup__main-container": {
      zIndex: 100,
    },
  },
}));

export const HeaderComp = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/"); // navigate to home
  };

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
      {/* <Grid item size={4}>
        <Box position="relative">
          <Grid
            container
            justifyContent="space-between"
            alignItems="flex-start"
          >
            
            <Grid item>
              <Box className={classes.logo} onClick={handleLogoClick}>
                <img className={classes.logoimg} src="/logo.png" alt="Logo" />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid> */}
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
        <Box
          className={classes?.logo}
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={handleLogoClick}

        >
          <img
            className={classes?.logoimg}
            src="/logo.png"
            alt="Logo"
            style={{
              maxWidth: "150px",
              height: "auto",
            }}
          />
        </Box>

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
